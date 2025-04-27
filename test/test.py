import cv2

img = cv2.imread(r"C:\Users\anshuman\Downloads\Bernie-I-Am-Once-Again-Asking-For-Your-Support.jpg")

img = cv2.rectangle(img, (220,570), (img.shape[1], img.shape[0]), (255, 0, 0), 2)

cv2.imshow('image', img)
cv2.waitKey(0)
cv2.destroyAllWindows()
