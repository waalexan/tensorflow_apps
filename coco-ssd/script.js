const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const status = document.getElementById('status');

// Ativa a câmera do usuário
async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // pode usar 'user' para câmera frontal
        audio: false
    });
    video.srcObject = stream;
    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

// Desenha as detecções no canvas
function drawPredictions(predictions) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox;
        context.strokeStyle = '#00FFFF';
        context.lineWidth = 2;
        context.strokeRect(x, y, width, height);
        context.font = '16px Arial';
        context.fillStyle = '#00FFFF';
        context.fillText(`${prediction.class} (${Math.round(prediction.score * 100)}%)`, x, y > 20 ? y - 5 : y + 15);
    });
}

async function main() {
    await setupCamera();
    video.play();

    const model = await cocoSsd.load();
    status.textContent = 'Modelo carregado. Detectando objetos...';

    // Loop de detecção
    const detectFrame = async () => {
        const predictions = await model.detect(video);
        drawPredictions(predictions);
        requestAnimationFrame(detectFrame);
    };

    detectFrame();
}

main();