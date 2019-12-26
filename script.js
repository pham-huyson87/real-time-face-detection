const video = document.getElementById('video');

const startVideo = () => {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    );
};


Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.ageGenderNet.loadFromUri('/models')
]).then(startVideo);


video.addEventListener(
    'play', 
    () => {

        const videoDisplaySize = { width: video.width, height: video.height };
        const canvas = faceapi.createCanvasFromMedia(video);
        const clearPreviousCanvas = () => canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);


        faceapi.matchDimensions(canvas, videoDisplaySize);      // To center the drawings too

        document.body.append(canvas);

        
        setInterval(async () => {

            clearPreviousCanvas();

            const detections =  await faceapi.detectAllFaces(
                                    video,
                                    new faceapi.TinyFaceDetectorOptions()
                                )
                                .withFaceLandmarks()
                                .withFaceExpressions()
                                .withAgeAndGender()
                                .withFaceDescriptors();


            // resize the detected boxes in case your displayed image has a different size than the original
            const resizedDetections = faceapi.resizeResults(detections, videoDisplaySize);


            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);


            resizedDetections.forEach(rs => {

                const drawTextField = new faceapi.draw.DrawTextField(
                                        [
                                            "Gender: "  +  rs.gender,
                                            "Age: "     +  Math.round(rs.age)
                                        ],
                                        rs.detection.box.topRight
                                    );

                drawTextField.draw(canvas);
            });
        }, 250);
    }
);
