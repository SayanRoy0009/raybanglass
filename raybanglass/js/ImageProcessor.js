class ImageProcessor {
  constructor() {
    if (typeof piexif === 'undefined') {
      throw new Error('piexif library is not loaded');
    }
  }

  getOrientation(dataUrl) {
    try {
      const exif = piexif.load(dataUrl);
      return exif['0th'][piexif.ImageIFD.Orientation] || 1;
    } catch {
      return 1;
    }
  }

  resizeAndNormalize(dataUrl, targetWidth, targetHeight, orientation = 1) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const isRotated = orientation >= 5 && orientation <= 8;
        
        canvas.width = isRotated ? targetHeight : targetWidth;
        canvas.height = isRotated ? targetWidth : targetHeight;
        
        const ctx = canvas.getContext('2d');

        switch (orientation) {
          case 2: ctx.setTransform(-1, 0, 0, 1, targetWidth, 0); break;
          case 3: ctx.setTransform(-1, 0, 0, -1, targetWidth, targetHeight); break;
          case 4: ctx.setTransform(1, 0, 0, -1, 0, targetHeight); break;
          case 5: ctx.setTransform(0, 1, 1, 0, 0, 0); break;
          case 6: ctx.setTransform(0, 1, -1, 0, targetHeight, 0); break;
          case 7: ctx.setTransform(0, -1, -1, 0, targetHeight, targetWidth); break;
          case 8: ctx.setTransform(0, -1, 1, 0, 0, targetWidth); break;
          default: ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  dataUrlToBlob(dataUrl) {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  // Abstract interface
  process(dataUrl) {
    throw new Error('Method "process()" must be implemented.');
  }
}