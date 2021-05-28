const URL = "https://teachablemachine.withgoogle.com/models/Gl_7xv0WP/";
const canvas = document.getElementById("canvas");

let model, webcam, ctx, labelContainer, maxPredictions;
var time=0;
var d=new Date();
var stop=false;
var firstStop=false;
var startnum=0;
var one=0;
var iinit=false;//initが再生されたか確認する

var character=[
    ["東方仗助","クレイジーダイヤモンド"],
    ["ジョルノ・ジョバーナ","ゴールドエクスペリエンス"],
    ["吉良吉影","キラークイーン"],
    ["DIO","ザ・ワールド"]
]



var x=new Array(10);
var y=new Array(10);
var s=new Array(10);
var music = new Audio('music/mymusic.wav');
var stopmusic = new Audio('music/DIO.wav');



async function init() {
    
    //music.play();  // 再生
    //music.pause();  // 一時停止
    if(startnum==0){
        startnum=1;
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        time=0;
        stop=false;
        for(let i=0;i<10;i++){
            x[i]= Math.random() * 600;
            y[i]= Math.random() * 600;
            s[i]= Math.floor(Math.random() * 200)+20;
            console.log(x[i]);
        }

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // Note: the pose library adds a tmPose object to your window (window.tmPose)
        model = await tmPose.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        const size = 600;
        const flip = true; // whether to flip the webcam

        webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append/get elements to the DOM
        
        canvas.width = size; canvas.height = size;
        ctx = canvas.getContext("2d");
        iinit=true;
        
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) { // and class labels
            labelContainer.appendChild(document.createElement("div"));
        }
    }else{
        stop=false;
        firstStop=false;
    }
    
}

function reOrder(){
    for(let i=0;i<10;i++){
        x[i]= Math.random() * 600;
        y[i]= Math.random() * 600;
        s[i]= Math.floor(Math.random() * 200)+20;
        console.log(x[i]);
    }
}

function savecanvas(){
    let link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'cancas.png';
    link.click();
}

function threetimeCamera(){
    if(iinit==true){stopmusic.play();}
    stop=true;
    firstStop=false;
    d=new Date();
    
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}


async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    one=0;
    for (let i = 0; i < maxPredictions; i++) {
        
        const classPrediction =prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        classPrediction.font = '32px ＭＳ Ｐゴシック';
        labelContainer.childNodes[i].innerHTML = classPrediction;
        if(prediction[one].probability<=prediction[i].probability){
            one=i;
        }
    }
    console.log(one);

    // finally draw the poses
    drawPose(pose);
}

function drawPose(pose) {
    if (webcam.canvas) {
        var d2=new Date();
        var ds=Math.floor(4-(d2.getTime()-d.getTime())/1000);

        if((ds>=1)||(stop==false)){
            ctx.drawImage(webcam.canvas, 0, 0);
            // draw the keypoints and skeleton
            if (pose) {
                const minPartConfidence = 0.5;
                ctx.lineWidth = 10;
                tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
                tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
            }
            ctx.lineWidth = 25;
            ctx.fillStyle = "#de4d4d";
            if(stop==true){            
                ctx.font="36px sans-serif";
                //ctx.fillText(ds, 300, 300);
            }
            
            
            for(let i=0;i<10;i++){
                ctx.font = s[i]+"px 'jojo'";
                ctx.fillStyle = "#330000";
                var px=Math.random()*5;
                var py=Math.random()*5;
                ctx.fillText("G", x[i]+px, y[i]+py);
                ctx.fillStyle = "#de4d4d";
                ctx.fillText("G", x[i]-5+px, y[i]-5+py);
                
            }
        }else{
            if(firstStop==false){
                firstStop=true;

                ctx.drawImage(webcam.canvas, 0, 0);
                for(let i=0;i<10;i++){
                    ctx.font = s[i]+"px 'jojo'";
                    ctx.fillStyle = "#330000";
                    var px=Math.random()*5;
                    var py=Math.random()*5;
                    ctx.fillText("ゴ", x[i]+px, y[i]+py);
                    ctx.fillStyle = "#de4d4d";
                    ctx.fillText("G", x[i]-5+px, y[i]-5+py);
                }
                
                if(one==3){
                    //
                    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                    // 描画内容に対して、上記のグレースケールにする式を当てはめながら
                    // rgbの値を計算する。
                    var dd = imageData.data;
                    for (var i = 0; i < dd.length; i+=4) {
                        dd[i] = 255 - dd[i];
                        dd[i+1] = 255 - dd[i+1];
                        dd[i+2] = 255 - dd[i+2];
                        // d[i+3]に格納されたα値は変更しない
                    }
                    // 計算結果でCanvasの表示内容を更新する。
                    ctx.putImageData(imageData, 0, 0);
                    //

                }
                ctx.fillStyle = "rgba( 0 , 0 , 0 ,0.5 )";
                ctx.fillRect(0,400,600,200);
                ctx.textAlign = 'center';
                ctx.font = '32px ＭＳ Ｐゴシック';
                ctx.fillStyle = 'rgb(255,255,255)';
                ctx.fillText("キャラ名："+character[one][0],300,450);
                ctx.fillText("スタンド名："+character[one][1],300,510);
                //var image = canvas.toDataURL('img/png');
                //console.log(image);
                //var image = canvas.toDataURL('image/png');
                //console.log(image);
                
            }
            
        }
        
       
        
    }
}
