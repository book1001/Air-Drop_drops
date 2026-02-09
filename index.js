const infoBtn = document.getElementById('infoBtn');
const infoText = document.getElementById('infoText');

infoBtn.addEventListener('click', () => {
  infoText.classList.toggle('hidden'); // hidden 클래스 토글
});




fetch('data/db_unique.json')
  .then(response => response.json())
  .then(data => {
    const content = document.getElementById('content');
    const log = document.getElementById('log');
    const entries = Array.isArray(data) ? data : [data];

    // 랜덤 선택 함수
    function showRandomEntry() {
      // 이전에 본 SVG index를 localStorage에서 가져오기
      let seenIndices = JSON.parse(localStorage.getItem('seenIndices') || '[]');

      // 선택 가능한 인덱스 필터링
      const availableIndices = entries
        .map((_, i) => i)
        .filter(i => !seenIndices.includes(i));

      if (availableIndices.length === 0) {
        // 모든 항목을 다 본 경우 초기화
        seenIndices = [];
        localStorage.setItem('seenIndices', JSON.stringify(seenIndices));
        availableIndices.push(...entries.map((_, i) => i));
      }

      // 랜덤으로 하나 선택
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const entry = entries[randomIndex];

      // 선택된 항목을 seenIndices에 추가
      seenIndices.push(randomIndex);
      localStorage.setItem('seenIndices', JSON.stringify(seenIndices));

      // 기존 content와 log 초기화
      content.innerHTML = '';
      log.innerHTML = '';

      const container = document.createElement('div');
      container.className = 'entry';

      const randomHue = Math.floor(Math.random() * 360);
      container.style.filter = `hue-rotate(${randomHue}deg)`;

      // SVG 렌더링
      const svgWrapper = document.createElement('div');
      svgWrapper.innerHTML = entry.svg;
      // svgWrapper.style.width = '100%';
      // svgWrapper.style.height = '100%';
      // svgWrapper.style.display = 'flex';
      // svgWrapper.style.justifyContent = 'center';
      // svgWrapper.style.alignItems = 'center';
      // svgWrapper.style.overflow = 'hidden';

      const svgElement = svgWrapper.querySelector('svg');
      if (svgElement) {
        // svgElement.style.width = '100%';
        // svgElement.style.height = '100%';
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      }

      // g 요소 순차 애니메이션
      const gElements = svgWrapper.querySelectorAll('g');
      gElements.forEach((g, index) => {
        g.classList.add('floating');
        g.style.animationDelay = `${index * 0.1}s`;
      });

      container.appendChild(svgWrapper);

      // 텍스트 정보
      const timestampP = document.createElement('p');
      timestampP.textContent = `Sent: ${entry.timestamp.date} ${entry.timestamp.time}`;
      log.appendChild(timestampP);
      // container.appendChild(timestampP);

      const deletedP = document.createElement('p');
      deletedP.textContent = `Received: ${entry.deleted.date} ${entry.deleted.time}`;
      log.appendChild(deletedP);

      const locationP = document.createElement('p');
      locationP.textContent = `Location: ${entry.location.longitude}° ${entry.location.latitude}°  `;
      log.appendChild(locationP);

      content.appendChild(container);
    }

    // 페이지 로드 시 첫 랜덤 선택
    showRandomEntry();

    // 버튼 클릭 시 랜덤 선택
    document.getElementById('randomBtn').addEventListener('click', showRandomEntry);
  })
  .catch(error => {
    console.error('Error loading JSON:', error);
  });






const downloadBtn = document.getElementById('downloadBtn');

downloadBtn.addEventListener('click', async () => {
  // 버튼 상태 변경
  downloadBtn.textContent = 'Downloading';
  downloadBtn.disabled = true;

  const original = document.querySelector('.entry');

  // 화면에 보이지 않는 클론 생성
  const clone = original.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.transform = 'none';

  // clone 내부의 drawingArea에서 scale 제거
  const cloneDrawingArea = clone.querySelector('#drawingArea');
  if (cloneDrawingArea) {
    cloneDrawingArea.style.transform = 'none';
  }

  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      backgroundColor: null,
      width: 750,
      height: 750,
      windowWidth: 750,
      windowHeight: 750,
      scale: 2,
      useCORS: true
    });

    const imageURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageURL;
    link.download = 'image.png';
    link.click();
  } catch (error) {
    console.error('다운로드 중 오류 발생:', error);
  } finally {
    // 클론 제거 및 버튼 상태 복구
    document.body.removeChild(clone);
    downloadBtn.textContent = 'Down';
    downloadBtn.disabled = false;
  }
});

