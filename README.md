
# Blockchain Name System (BNS)

### Message format:
`
  (alias_hash, '${alias}:${network}:${address}')
`  

  
alias hash - sha1 hash  
___

### Values storing format:


  `alias_hash : {  
    alias,  
    addresses  {  
      network1 : address1,  
      ...  
    }
  }`
___


[kad repo with examples](https://github.com/kadtools/kad/blob/master/example/expanded.js)

1. **kad-base** - base node. Other nodes connect ot it.
2. **kad-first** - first node to connect to base.
3. **kad-node** - simple node

There are two scenarious in kad-node:
- store new value
- get value