const { request } = require('express')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middlewares/requireLogin')
const Post = mongoose.model("Post")

router.get('/allpost',requireLogin,(req,res)=>{
    Post.find()
    .populate("postedBy","_id name pic")
    .populate("comments.postedBy","_id name pic")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/followingpost',requireLogin,(req,res)=>{

    Post.find({postedBy:{$in:req.user.following}})
    .populate("postedBy","_id name pic")
    .populate("comments.postedBy","_id name pic")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.post('/createpost',requireLogin,(req,res)=>{
    
    const{title,body,pic}=req.body
    if(!title || !body || !pic){
        return res.status(422).json({error:"title or body missing"})
    }
    req.user.password = undefined
    const post =  new Post({
        title,
        body,
        photo:pic,
        postedBy:req.user
    })
    post.save()
    .then(result=>{
        res.json({post:result})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/mypost',requireLogin,(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("PostedBy","_id name pic")
    .then(mypost=>{
        res.json({mypost})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.put('/like',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}},
        {new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        else{
            res.json(result)
        }
    })
})

router.put('/unlike',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}},
        {new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        else{
            res.json(result)
        }
    })
})

router.put('/comment',requireLogin,(req,res)=>{
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}},
        {new:true
    })
    .populate("comments.postedBy","_id name pic")
    .populate("postedBy","_id name pic")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        else{
            res.json(result)
        }
    })
})

router.delete('/deletepost/:postId',requireLogin,(req,res)=>{
    Post.findOne({_id:req.params.postId})
    .populate("postedBy","_id")
    .exec((err,post)=>{
        if(err || !post){
            return res.status(422).json({error:err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
            post.remove()
            .then(result=>{
                res.json(
                    result
                )
            }).catch(err=>{
                console.log(err)
            })
        }
    })
})


router.delete("/deletecomment/:id/:comment_id", requireLogin, (req, res) => {
    const comment = { _id: req.params.comment_id };
    Post.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { comments: comment },
      },
      {
        new: true, 
      }
    )
      .populate("comments.postedBy", "_id name pic")
      .populate("postedBy", "_id name pic")
      .exec((err, postComment) => {
        if (err || !postComment) {
          return res.status(422).json({ error: err });
        } else {
         
          const result = postComment;
          res.json(result);
        }
      });
  });


module.exports = router