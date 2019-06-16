let reg= {
  
  regex(start,end,s){
	// let reg=/++(.+?)hj/g
	let reg=new RegExp(start+'(.+?)'+end,'gm');
// 	let reg=/apply(.+?)def/gm
     var t=s.match(reg);
     let p=[]
	 for(var c in t){
		p.push(t[c])
	  // console.log(t[c]);
	 }
	 return p
  },
  regexOne(start,end,s){
  	 let p=this.regex(start,end,s)
  	 if(p.length>0)
  	 	return p[0]
  	 return ''
  }
}

module.exports=reg

