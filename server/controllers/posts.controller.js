const db = require('../config/db');
const { clean } = require('../utils/validators');

const selectPosts = `SELECT p.id,p.content,p.image_url,p.created_at,p.updated_at,
 u.id user_id,u.full_name,u.username,u.avatar_url,
 (SELECT COUNT(*) FROM likes l WHERE l.post_id=p.id)::int likes_count,
 (SELECT COUNT(*) FROM comments c WHERE c.post_id=p.id)::int comments_count,
 EXISTS(SELECT 1 FROM likes l WHERE l.post_id=p.id AND l.user_id=$1) liked,
 (p.user_id=$1) is_owner
 FROM posts p JOIN users u ON u.id=p.user_id`;
const mapPost = r => ({
  id:Number(r.id),content:r.content,imageUrl:r.image_url,createdAt:r.created_at,updatedAt:r.updated_at,
  author:{id:Number(r.user_id),fullName:r.full_name,username:r.username,avatarUrl:r.avatar_url},
  likesCount:Number(r.likes_count),commentsCount:Number(r.comments_count),liked:Boolean(r.liked),isOwner:Boolean(r.is_owner)
});

async function list(req,res,next){
  try{
    const mode=req.query.mode==='explore'?'explore':'feed';
    const where=mode==='feed'?`WHERE p.user_id=$1 OR p.user_id IN (SELECT following_id FROM followers WHERE follower_id=$1)`:'';
    let result=await db.query(`${selectPosts} ${where} ORDER BY p.created_at DESC LIMIT 60`,[req.user.id]);
    if(mode==='feed' && !result.rowCount) result=await db.query(`${selectPosts} ORDER BY p.created_at DESC LIMIT 60`,[req.user.id]);
    res.json({posts:result.rows.map(mapPost)});
  }catch(e){next(e)}
}
async function getOne(req,res,next){
  try{const r=await db.query(`${selectPosts} WHERE p.id=$2`,[req.user.id,Number(req.params.id)]);if(!r.rowCount)return res.status(404).json({message:'Post not found.'});res.json({post:mapPost(r.rows[0])});}catch(e){next(e)}
}
async function byUser(req,res,next){
  try{const r=await db.query(`${selectPosts} WHERE p.user_id=$2 ORDER BY p.created_at DESC`,[req.user.id,Number(req.params.userId)]);res.json({posts:r.rows.map(mapPost)});}catch(e){next(e)}
}
async function create(req,res,next){
  try{
    const content=clean(req.body.content,500);const imageUrl=req.file?`/uploads/${req.file.filename}`:null;
    if(!content&&!imageUrl)return res.status(400).json({message:'Write something or add an image.'});
    const ins=await db.query('INSERT INTO posts(user_id,content,image_url) VALUES($1,$2,$3) RETURNING id',[req.user.id,content,imageUrl]);
    const r=await db.query(`${selectPosts} WHERE p.id=$2`,[req.user.id,ins.rows[0].id]);
    res.status(201).json({message:'Post published.',post:mapPost(r.rows[0])});
  }catch(e){next(e)}
}
async function update(req,res,next){
  try{const content=clean(req.body.content,500);if(!content)return res.status(400).json({message:'Post cannot be empty.'});const r=await db.query('UPDATE posts SET content=$1,updated_at=NOW() WHERE id=$2 AND user_id=$3 RETURNING id',[content,Number(req.params.id),req.user.id]);if(!r.rowCount)return res.status(403).json({message:'You can only edit your own posts.'});res.json({message:'Post updated.'});}catch(e){next(e)}
}
async function remove(req,res,next){
  try{const r=await db.query('DELETE FROM posts WHERE id=$1 AND user_id=$2 RETURNING id',[Number(req.params.id),req.user.id]);if(!r.rowCount)return res.status(403).json({message:'You can only delete your own posts.'});res.json({message:'Post deleted.'});}catch(e){next(e)}
}
async function like(req,res,next){
  try{const postId=Number(req.params.id);const owner=await db.query('SELECT user_id FROM posts WHERE id=$1',[postId]);if(!owner.rowCount)return res.status(404).json({message:'Post not found.'});const r=await db.query('INSERT INTO likes(user_id,post_id) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING *',[req.user.id,postId]);if(r.rowCount&&Number(owner.rows[0].user_id)!==req.user.id)await db.query("INSERT INTO notifications(user_id,actor_id,type,post_id) VALUES($1,$2,'like',$3)",[owner.rows[0].user_id,req.user.id,postId]);const c=await db.query('SELECT COUNT(*)::int count FROM likes WHERE post_id=$1',[postId]);res.json({liked:true,likesCount:c.rows[0].count});}catch(e){next(e)}
}
async function unlike(req,res,next){try{const id=Number(req.params.id);await db.query('DELETE FROM likes WHERE user_id=$1 AND post_id=$2',[req.user.id,id]);const c=await db.query('SELECT COUNT(*)::int count FROM likes WHERE post_id=$1',[id]);res.json({liked:false,likesCount:c.rows[0].count});}catch(e){next(e)}}
module.exports={list,getOne,byUser,create,update,remove,like,unlike};
