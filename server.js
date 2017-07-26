// server.js
// where your node app starts

var compression = require('compression');
var cors = require('cors');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var Trello = require('node-trello');
var Promise = require('bluebird')

var _ = require('underscore')
// compress our client side content before sending it over the wire
app.use(compression());

// your manifest must have appropriate CORS headers, you could also use '*'
app.use(cors({ origin: 'https://trello.com' }));
app.use( bodyParser.json() );
app.use(express.static('public'));



app.engine('.html', require('ejs').renderFile);
app.get("/auth", function(req, res){
    
    res.render("auth.html", { webhookModel : req.query.model });
});


var t

app.all("/webhooks", function(req, res) {

  res.setHeader('Content-Type', 'text')
  if(req.body.action === undefined) {
    res.end()
    return
  }
  
  var type = req.body.action.type
  
  
  //console.log(req.body)
  if(type == "updateCheckItemStateOnCard")
    handleItemChecked(req)
  //else console.log('type :', type)
  res.end()
  
  
  
})


function handleItemChecked(req){
  //console.log('token', req.query.token)
  t = new Trello('910aeb0b23c2e63299f8fb460f9bda36', req.query.token) //req.query.token)
  var data = req.body.action.data
  var checkItem = data.checkItem
  var cardId = data.card.id
  console.log('data', data.board.id)


  
  
  if(checkItem.state === 'incomplete')
    return;
  //trouer une meilleure regexp
  var re1 = new RegExp(">(.*?)\"(.*?)\".\"(.*?)\"")
  var re2 = new RegExp(">(.*?)\"(.*?)\"")
  var res1 = re1.exec(checkItem.name)

  var res2 = re2.exec(checkItem.name)
  if(res1 === null && res2 ===null)
    return;
  
  
  var listName = res1 ? res1[3] : res2[2]

   
  return (res1 ? getBoardIdFromBoardName(res1[2]) : Promise.resolve(data.board.id))
  .then(function(boardId){
    console.log("boardId", boardId)
    getListIdFromListName(boardId, listName)
    .then(function(list){
      return moveCard(cardId, list, boardId)
    })
  })



  
}




function getBoardIdFromBoardName(boardName){
  console.log("Getting board id ", boardName)

  return new Promise(function(resolve, reject){  
    t.get("/1/search", {query : boardName, modelTypes : 'boards', board_fields : 'id'}, function(err, data){
      if(err) return reject(err)
      resolve(data.boards[0].id)
    })
    
  })
}

function moveCard(idCardSource, idListDest, idBoardDest){
  console.log("Moving ", idCardSource, "to ", idListDest)

  return new Promise(function(resolve, reject){  
    t.put("/1/cards/"+idCardSource, { idList : idListDest, idBoard : idBoardDest }, function(err, data){
      if(err) return reject(err)
      resolve()
    })
    
  })
}



function copyChecklist(idChecklistSource, destCard){
  console.log("Copying ", idChecklistSource, "to ", destCard)
  
  return new Promise(function(resolve, reject){  
    t.post("/1/checklists/", {idChecklistSource : idChecklistSource, idCard : destCard }, function(err, data){
      if(err) return reject(err)
      resolve()
    })
    
  })
}

function getListIdFromListName(boardId, listName){
  console.log('getting list id ', listName, "from board", boardId)
  return new Promise(function(resolve, reject){  
    if(boardId === undefined) return reject('boardId not found')
    var listId;
    
    t.get("/1/boards/"+boardId+"/lists/", function(err, lists){  
      if(err) return reject(err)

      lists.forEach(function(list){  
        if(list.name == listName)
          listId = list.id       
      })
      console.log('resolve', listId)
      resolve(listId)     
    }) 
    
  })
}


function getCardIdFromCardName(listId, cardName){
  return new Promise(function(resolve, reject){
    if(listId === undefined) return reject('list not found')
    var cardId;
    
    t.get("/1/lists/"+listId+"/cards/", function(err, cards){  
      cards.forEach(function(card){    
        if(card.name == cardName)
          cardId = card.id
      }) 
      if(cardId === undefined) 
        return reject("card " + cardName + " not found in list " + listId)
      resolve(cardId)     
    }) 
  })
}


function getChecklistsList(cardId){
  return new Promise(function(resolve, reject){
    t.get("/1/cards/"+cardId+"/checklists", function(err, checklists){
      if(err) 
        return reject(err)
      resolve(checklists)
      
    })
  
  })
}







// listen for requests 
var listener = app.listen(process.env.PORT, function () {
  console.info(`Node Version: ${process.version}`);
  console.log('Trello Power-Up Server listening on port ' + listener.address().port);
});

