import bodyparser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import capitalize from 'lodash.capitalize';
import _ from 'lodash';
 
const app = express();
 
app.set('view engine', 'ejs');
 
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));
 
 
 

 



app.get("/about", function (req, res) {
  res.render("about");
});
 
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
 
async function main() {
  try {
      await mongoose.connect('mongodb+srv://admin-ndanga:Test123@cluster0.xhsq4sc.mongodb.net/todolistDB');
      console.log('Connected to MongoDB');
  } catch (error) {
      console.log('Could not connect to MongoDB');
      throw error;
  }
  const itemsSchema = new mongoose.Schema({
    name: String
  });
    
  const Item = mongoose.model("Item", itemsSchema);  
  const item1 = new Item({name: "Eating"});
  const item2 = new Item({name: "Improve analysis"});
  const item3 = new Item({name: "Sleeping"});
  
  const defaultItems = [item1, item2, item3];

  
  
  
  app.get("/", function (req, res) {
    
    Item.find({})
    .then((result)=>{
      if(result.length===0){
        Item.insertMany(defaultItems).then(()=>{
          console.log("Insert successfull.");
          res.redirect('/');
          res.render("list", { listTitle: "Today", newListItems: result });
          

          }).catch((err)=>{
            console.log(err)
          });
          }
          
     else{console.log("data exists");
     res.render("list", { listTitle: "Today", newListItems: result });}
     
    });
    
    
  })
  const customListSchema=new mongoose.Schema(
    {
      name:String,
      items:[itemsSchema]
    }
  )
  const customList = mongoose.model('customList', customListSchema);
  app.get("/:paramName", function (req, res) {
    var currentPage = req.params.paramName;
    currentPage=_.capitalize(currentPage);
    const customList = mongoose.model('customList', customListSchema);
  
    customList.findOne({ name: currentPage }).then((foundList) => {
      if (!foundList) {
        const actualList = new customList({
          name: currentPage,
          items: defaultItems
        });
        
        actualList.save().then((err) => {
          console.log("didnt exist");
            res.redirect('/' + currentPage);
          
        });
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }).catch((err) => {
      console.log(err);
    });
  });
  
    
  app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const title = req.body.list;
    if (title === "Today") {
      const item = new Item({ name: itemName });
      item.save().then(() => {
        res.redirect('/');
      }).catch((err) => {
        console.log(err);
      });
    } else {
      const customList = mongoose.model('customList', customListSchema);
      customList.findOne({ name: title }).then((foundList) => {
        if (!foundList) {
          const actualList = new customList({
            name: title,
            items: [{ name: itemName }]
          });
          actualList.save().then(() => {
            res.redirect('/' + title);
          }).catch((err) => {
            console.log(err);
          });
        } else {
          foundList.items.push({ name: itemName });
          foundList.save().then(() => {
            res.redirect('/' + title);
          })
        }
      })
    }
  });
  
    
    app.post("/delete",(req,res)=>{
      const title = req.body.delete;
      
      
      if(title==="Today"){
        Item.findByIdAndRemove(req.body.checkbox).then((err)=>{if(err){console.log(err);}});
      res.redirect('/')}
      
      else{
       
        customList.findOneAndUpdate({name:title},{$pull:{items:{_id:req.body.checkbox}}})
        .then(()=>{res.redirect('/'+title)});

      }
        



    })
  }
  main();
  