module.exports =  (a,b) => {
  return a.filter(x=>!b.includes(x));
}

// let intersection = a.filter(x => b.includes(x));
// let aOnly = a.filter(x=>!b.includes(x));
// let bOnly = b.filter(x=>!a.includes(x));
