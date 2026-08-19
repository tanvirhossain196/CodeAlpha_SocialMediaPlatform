const db = require('../config/db');
const { validateProfile, clean } = require('../utils/validators');

const mapUser = (r) => ({
  id:Number(r.id), fullName:r.full_name, username:r.username, email:r.email, bio:r.bio,
  avatarUrl:r.avatar_url, createdAt:r.created_at,
  postsCount:Number(r.posts_count||0), followersCount:Number(r.followers_count||0), followingCount:Number(r.following_count||0),
  isFollowing:Boolean(r.is_following), isOwnProfile:Boolean(r.is_own_profile)
});

async function getUser(req, res, next) {
  try {
    const viewerId = req.user?.id || 0;
    const value = req.params.id;
    const byId = /^\d+$/.test(value);
    const result = await db.query(`
      SELECT u.id,u.full_name,u.username,u.bio,u.avatar_url,u.created_at,
        (SELECT COUNT(*) FROM posts p WHERE p.user_id=u.id) posts_count,
        (SELECT COUNT(*) FROM followers f WHERE f.following_id=u.id) followers_count,
        (SELECT COUNT(*) FROM followers f WHERE f.follower_id=u.id) following_count,
        EXISTS(SELECT 1 FROM followers f WHERE f.follower_id=$1 AND f.following_id=u.id) is_following,
        (u.id=$1) is_own_profile
      FROM users u WHERE ${byId ? 'u.id=$2' : 'lower(u.username)=lower($2)'} LIMIT 1`, [viewerId, value]);
    if (!result.rowCount) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: mapUser(result.rows[0]) });
  } catch (err) { next(err); }
}

async function updateUser(req, res, next) {
  try {
    const target = Number(req.params.id);
    if (target !== req.user.id) return res.status(403).json({ message: 'You can only edit your own profile.' });
    const { errors, data } = validateProfile(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });
    const duplicate = await db.query('SELECT 1 FROM users WHERE username=$1 AND id<>$2', [data.username,target]);
    if (duplicate.rowCount) return res.status(409).json({ message: 'That username is already taken.', errors:{ username:'That username is already taken.' } });
    const avatarUrl = req.file ? `/uploads/${req.file.filename}` : clean(req.body.avatarUrl, 500) || null;
    const result = await db.query(`UPDATE users SET full_name=$1,username=$2,bio=$3,avatar_url=COALESCE($4,avatar_url),updated_at=NOW()
      WHERE id=$5 RETURNING id,full_name,username,email,bio,avatar_url,created_at`, [data.fullName,data.username,data.bio,avatarUrl,target]);
    res.json({ message:'Profile updated successfully.', user: mapUser(result.rows[0]) });
  } catch (err) { next(err); }
}

async function searchUsers(req, res, next) {
  try {
    const q = clean(req.query.q, 60);
    const viewerId = req.user.id;
    const result = await db.query(`SELECT u.id,u.full_name,u.username,u.bio,u.avatar_url,u.created_at,
      EXISTS(SELECT 1 FROM followers f WHERE f.follower_id=$1 AND f.following_id=u.id) is_following,
      (u.id=$1) is_own_profile FROM users u
      WHERE ($2='' OR lower(u.username) LIKE lower($3) OR lower(u.full_name) LIKE lower($3))
      ORDER BY CASE WHEN lower(u.username)=lower($2) THEN 0 ELSE 1 END,u.full_name LIMIT 30`, [viewerId,q,`%${q}%`]);
    res.json({ users: result.rows.map(mapUser) });
  } catch (err) { next(err); }
}

async function follow(req, res, next) {
  try {
    const target = Number(req.params.id);
    if (target === req.user.id) return res.status(400).json({ message:'You cannot follow yourself.' });
    const exists = await db.query('SELECT 1 FROM users WHERE id=$1', [target]);
    if (!exists.rowCount) return res.status(404).json({ message:'User not found.' });
    const result = await db.query('INSERT INTO followers(follower_id,following_id) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING *', [req.user.id,target]);
    if (result.rowCount) await db.query(`INSERT INTO notifications(user_id,actor_id,type) VALUES($1,$2,'follow')`, [target,req.user.id]);
    const count = await db.query('SELECT COUNT(*)::int count FROM followers WHERE following_id=$1',[target]);
    res.json({ message:'Following user.', isFollowing:true, followersCount:count.rows[0].count });
  } catch (err) { next(err); }
}

async function unfollow(req, res, next) {
  try {
    const target = Number(req.params.id);
    await db.query('DELETE FROM followers WHERE follower_id=$1 AND following_id=$2',[req.user.id,target]);
    const count = await db.query('SELECT COUNT(*)::int count FROM followers WHERE following_id=$1',[target]);
    res.json({ message:'Unfollowed user.', isFollowing:false, followersCount:count.rows[0].count });
  } catch (err) { next(err); }
}

async function connections(req, res, next, mode) {
  try {
    const id = Number(req.params.id);
    const join = mode === 'followers' ? 'f.follower_id=u.id' : 'f.following_id=u.id';
    const where = mode === 'followers' ? 'f.following_id=$2' : 'f.follower_id=$2';
    const result = await db.query(`SELECT u.id,u.full_name,u.username,u.bio,u.avatar_url,u.created_at,
      EXISTS(SELECT 1 FROM followers x WHERE x.follower_id=$1 AND x.following_id=u.id) is_following,
      (u.id=$1) is_own_profile FROM followers f JOIN users u ON ${join} WHERE ${where} ORDER BY f.created_at DESC`, [req.user.id,id]);
    res.json({ users:result.rows.map(mapUser), mode });
  } catch (err) { next(err); }
}
const followers = (req,res,next)=>connections(req,res,next,'followers');
const following = (req,res,next)=>connections(req,res,next,'following');

module.exports = { getUser, updateUser, searchUsers, follow, unfollow, followers, following };
