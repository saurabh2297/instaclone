import React,{useState,useEffect,useContext} from 'react'
import {UserContext} from '../../App'
import {Link} from 'react-router-dom'

const Home = () => {
    const [data,setData] = useState([])
    const {state,dispatch} = useContext(UserContext)
    useEffect(()=>{
        fetch('/allpost',{
            headers:{
                
                "Authorization":"Bearer " + localStorage.getItem("jwt")
            }
        }).then(res=>res.json())
        .then(result=>{
            setData(result.posts)
        }
        )
    },[])

    const likePost = (id)=>{
        fetch('/like',{
            method: "put",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                postId:id
            })
        }).then(res=>res.json())
        .then(result=>{
            const newData = data.map(item=>{
                if(item._id==result._id){
                    return result
                }else{
                    return item
                }
            })
            setData(newData)
        }).catch(err=>{
            console.log(err)
        })
    }

    const unlikePost = (id)=>{
        fetch('/unlike',{
            method: "put",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                postId:id
            })
        }).then(res=>res.json())
        .then(result=>{
            
            const newData = data.map(item=>{
                if(item._id==result._id){
                    return result
                }else{
                    return item
                }
            })
            setData(newData)
        }).catch(err=>{
            console.log(err)
        })
    }

    const  makeComment = (text,postId)=>{
        fetch('/comment',{
            method:"put",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+localStorage.getItem("jwt")
            },
            body:JSON.stringify({
                postId,text
            })
        }).then(res => res.json())
        .then(result=>{
            console.log(result)
            const newData = data.map(item=>{
            if(item._id==result._id){
                return result
            }else{
                return item
            }
        })
        setData(newData)
        }).catch(err=>{
            console.log(err)
        })
    }
    const deletePost = (postid)=>{
        fetch(`/deletepost/${postid}`,{
            method:"delete",
            headers:{
                Authorization:"Bearer "+localStorage.getItem("jwt")
            }
        }).then(res=>res.json())
        .then(result=>{
            console.log(result)
            const newData = data.filter(item=>{
                return item._id !== result._id
            })
            setData(newData)
        })
    }

    const deleteComment = (postid, commentid) => {
        fetch(`/deletecomment/${postid}/${commentid}`, {
          method: "delete",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("jwt"),
          },
        })
          .then((res) => res.json())
          .then((result) => {
                 const newData = data.map((item) => {
    
              if (item._id == result._id) {
                         return result;
              } else {
                return item;
              }
            });
            setData(newData);
          });
      };
    return (
        <div className="home">
        {
            data.map(item=>{
                return(
                <div className="card home-card" key={item._id}>
                <h5 style = {{padding:"8px",marginTop:"-6px"}}><Link to={item.postedBy._id !== state._id ? "/profile/"+item.postedBy._id:"/profile/"}>
                <img style={{width:"36px",height:"36px",borderRadius:"16px",display:"inline",margin: "-3px 6px"}}
                    src={item.postedBy.pic} 
                />
                {item.postedBy.name}</Link>{item.postedBy._id == state._id &&
                <i className="material-icons" style={{float:"right"}} onClick={()=>deletePost(item._id)}>delete</i>}
                </h5>
                <div className="card-image">
                    <img src={item.photo}/>
                </div>
                <div className="card-content">
                
                {item.likes.includes(state._id)
                ? 
                <i className="material-icons" style={{color:"red"}} onClick={()=>{unlikePost(item._id)}}>favorite</i>
                :
                <i className="material-icons"  onClick={()=>{likePost(item._id)}}>favorite</i>
                }
                    <h5>{item.likes.length} likes</h5>
                    <h5>{item.title}</h5>
                    <p>{item.body}</p>
                    {console.log(item)}
                    {
                        item.comments.map(record=>{
                            return(
                                
                                <h6 key={record._id}><span style={{fontWeight:"500",marginLeft:"3px"}}>
                                <img style={{width:"30px",height:"30px",borderRadius:"14px",display:"inline",margin: "-3px 6px"}}
                                 src={item.postedBy.pic} />  {record.postedBy.name} </span>  {record.text}
                                {item.postedBy._id == state._id &&
                                       <i className="material-icons" style={{float:"right"}} onClick={()=>deleteComment(item._id, record._id)}>delete</i>}</h6>
                            )
                        })
                    }
                    <form onSubmit={(e)=>{
                        e.preventDefault()
                        makeComment(e.target[0].value,item._id)
                    }}>
                    <input type="text" placeholder="add comment"/>
                    </form>
                    
                </div>       
            </div>
                )
            })
        } 
        </div>
    )
}

export default Home
