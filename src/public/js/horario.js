//Intentar poner las horas con js 
for(let j=1; j<5; j++){
    for(let i=0; i<25; i++){
        let a = document.createElement("option");
        a.setAttribute("class", "dropdown-item");    
        if(i.toString().length == 1){
            a.setAttribute("value", "0"+i.toString());
            a.appendChild(document.createTextNode("0"+i.toString()));
            document.getElementById("inhoras"+j.toString()).appendChild(a);
        }else{
            a.setAttribute("value", i.toString());
            a.appendChild(document.createTextNode(i.toString()));
            document.getElementById("inhoras"+j.toString()).appendChild(a);
        }
    }
}

