


const filterResponse = (obj , ...responseToSend)=>{
    const result = {}
    responseToSend.forEach((item)=>{
        result[item] = obj[item]
    })
    return result
}




export{ filterResponse  }