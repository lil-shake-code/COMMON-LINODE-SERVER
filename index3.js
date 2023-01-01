import sequest from "sequest";
var seq = sequest.connect("root@172.104.207.207");
console.log(process.stdout);
seq.pipe(process.stdout); // only necessary if you want to see the output in your terminal
seq.write("ls -la");
seq.write("touch testfile");
seq.write("ls -la");
seq.end();
