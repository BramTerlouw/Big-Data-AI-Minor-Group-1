import cv2
import numpy as np
import onnxruntime as ort
import torch
from yolov5.utils.general import non_max_suppression

# Load the ONNX model
session = ort.InferenceSession('best.onnx', providers=['CPUExecutionProvider'])
input_name = session.get_inputs()[0].name
output_names = [out.name for out in session.get_outputs()]

# Load the image
image = cv2.imread("image.jpg", cv2.IMREAD_UNCHANGED)

# Preprocess the image
img_data = cv2.resize(image, (640, 640), interpolation=cv2.INTER_AREA)
img_data = img_data.astype('float32') / 255.0
img_data = np.expand_dims(img_data, axis=0)  # Add batch dimension
img_data = np.transpose(img_data, (0, 3, 1, 2))  # Transpose to WENCH format

# Run the ONNX model
predictions = session.run(output_names, {input_name: img_data})
predictions = [torch.tensor(pred) for pred in predictions]  # Convert NumPy arrays to PyTorch tensors

# Perform NMS on the predictions
conf_threshold = 0.25
iou_threshold = 0.45
detections = non_max_suppression(predictions, conf_threshold, iou_threshold)[0]

image = cv2.resize(image, (640, 640), interpolation=cv2.INTER_AREA)

for *xyxy, conf, cls in detections:
    x1, y1, x2, y2 = [int(i) for i in xyxy]  # no need to scale the coordinates
    label = f"{int(cls)} {conf:.2f}"
    cv2.rectangle(image, (x1, y1), (x2, y2), (255, 0, 0), 2)
    cv2.putText(image, label, (x1, y1), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)


# Display the image
cv2.imshow('Image', image)
cv2.waitKey(0)
cv2.destroyAllWindows()
