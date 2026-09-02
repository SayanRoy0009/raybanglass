document.addEventListener('DOMContentLoaded', () => {
  const converter = new MetaGlassesConverter();

 
  const TRACKER_NAMESPACE = "sayanroy0009-rayban-meta";


  const StatsTracker = {
    async hit(key) {
      try {
        // Try incrementing via CounterAPI
        const res = await fetch(`https://api.counterapi.dev/v1/${TRACKER_NAMESPACE}/${key}/up`);
        if (!res.ok) {
          // If key doesn't exist yet, create/initialize it
          const setRes = await fetch(`https://api.counterapi.dev/v1/${TRACKER_NAMESPACE}/${key}/set?count=1`);
          const setData = await setRes.json();
          return setData.count || 1;
        }
        const data = await res.json();
        return data.count;
      } catch (err) {
        console.warn(`Counter hit error for ${key}:`, err);
        return null;
      }
    },

    async get(key) {
      try {
        const res = await fetch(`https://api.counterapi.dev/v1/${TRACKER_NAMESPACE}/${key}`);
        if (!res.ok) {
          // Key doesn't exist yet, initialize with 0
          await fetch(`https://api.counterapi.dev/v1/${TRACKER_NAMESPACE}/${key}/set?count=0`);
          return 0;
        }
        const data = await res.json();
        return data.count ?? 0;
      } catch (err) {
        console.warn(`Counter get error for ${key}:`, err);
        return null;
      }
    }
  };

  // Elements
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const cameraInput = document.getElementById('cameraInput');
  const cameraBtn = document.getElementById('cameraBtn');
  const galleryBtn = document.getElementById('galleryBtn');
  const previewContainer = document.getElementById('previewContainer');
  const previewImage = document.getElementById('previewImage');
  const previewBadge = document.getElementById('previewBadge');
  const dropTitle = document.getElementById('dropTitle');
  const dropDesc = document.getElementById('dropDesc');
  const runBtn = document.getElementById('runBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const shareBtn = document.getElementById('shareBtn');
  const toast = document.getElementById('statusToast');
  const visitCountEl = document.getElementById('visitCount');
  const conversionCountEl = document.getElementById('conversionCount');

  let currentSourceDataUrl = null;
  let finalResult = null;

  // Initialize Global Counters
  (async () => {
    const visits = await StatsTracker.hit('page_visits');
    if (visits !== null) {
      visitCountEl.textContent = visits.toLocaleString();
    }

    const conversions = await StatsTracker.get('photos_converted');
    if (conversions !== null) {
      conversionCountEl.textContent = conversions.toLocaleString();
    }
  })();

  const showToast = (msg, type = 'success') => {
    toast.textContent = msg;
    toast.className = `toast ${type}`;
    setTimeout(() => {
      toast.style.display = 'none';
      toast.className = 'toast';
    }, 4500);
  };

  const setProcessing = (busy) => {
    runBtn.disabled = busy;
    runBtn.textContent = busy ? 'Processing…' : 'Convert & Export';
  };

  // Direct download handler working universally on Mobile and PC
  const triggerDownload = (dataUrl, filename = 'meta-converted.jpg') => {
    const blob = converter.dataUrlToBlob(dataUrl);
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      link.remove();
    }, 4000);
  };

  // Triggers
  cameraBtn.onclick = () => cameraInput.click();
  galleryBtn.onclick = () => fileInput.click();
  dropZone.onclick = () => fileInput.click();

  // File loading
  const handleFile = (file) => {
    if (!file || (!file.type.includes('jpeg') && !/\.jpe?g$/i.test(file.name))) {
      showToast('Only JPEG / JPG formats are valid.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      currentSourceDataUrl = e.target.result;
      previewImage.src = currentSourceDataUrl;
      previewContainer.style.display = 'block';
      previewBadge.textContent = 'Source Loaded';
      dropTitle.textContent = file.name;
      dropDesc.textContent = `${(file.size / 1024).toFixed(1)} KB`;

      runBtn.disabled = false;
      downloadBtn.disabled = true;
      shareBtn.disabled = true;
    };
    reader.readAsDataURL(file);
  };

  fileInput.onchange = (e) => handleFile(e.target.files[0]);
  cameraInput.onchange = (e) => handleFile(e.target.files[0]);

  // Drag-and-drop
  dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  };
  dropZone.ondragleave = () => dropZone.classList.remove('dragover');
  dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files?.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Primary Run Action: Converts and triggers immediate download
  runBtn.onclick = async () => {
    if (!currentSourceDataUrl) return;

    setProcessing(true);
    try {
      finalResult = await converter.process(currentSourceDataUrl);
      previewImage.src = finalResult.dataUrl;
      previewBadge.textContent = 'Meta EXIF Ready';
      downloadBtn.disabled = false;
      shareBtn.disabled = false;

      // Automatically initiate download
      triggerDownload(finalResult.dataUrl);
      showToast('Conversion complete. Image download initiated.');

      // Increment conversion count
      StatsTracker.hit('photos_converted').then((count) => {
        if (count !== null) {
          conversionCountEl.textContent = count.toLocaleString();
        }
      });
    } catch (err) {
      console.error(err);
      showToast('Conversion failed. Inspect file contents.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Direct Download Button Action
  downloadBtn.onclick = () => {
    if (!finalResult?.dataUrl) return;
    triggerDownload(finalResult.dataUrl);
    showToast('Download started.');
  };

  // Native Share Button Action (Mobile fallback to download)
  shareBtn.onclick = async () => {
    if (!finalResult?.dataUrl) return;

    const blob = converter.dataUrlToBlob(finalResult.dataUrl);
    const file = new File([blob], 'meta-converted.jpg', { type: 'image/jpeg' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Meta Photo',
          text: 'Converted Ray-Ban Meta Glasses profile'
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback to download if Web Share is not supported
    triggerDownload(finalResult.dataUrl);
    showToast('Share unavailable. Download initiated instead.');
  };
});
