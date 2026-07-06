"use strict";

const IMAGE_URL = "./img/Map.png";

/*
 * trueにすると、ブースの当たり判定を赤枠で表示します。
 * 位置調整が終わったらfalseにしてください。
 */
const DEBUG_MODE = true;
/*
 * 画像を先に読み込み、実際の画像サイズを取得します。
 */
const image = new Image();

let booths = [];

image.onload = function () {
  initializeMap(image.naturalWidth, image.naturalHeight);
};

image.onerror = function () {
  console.error(`画像を読み込めませんでした: ${IMAGE_URL}`);
  alert("会場画像を読み込めませんでした。画像ファイル名を確認してください。");
};

image.src = IMAGE_URL;

function initializeMap(imageWidth, imageHeight) {
  const map = L.map("map", {
    crs: L.CRS.Simple,
    minZoom: -3,
    maxZoom: 4,
    zoomSnap: 0.25,
    zoomDelta: 0.5,
    attributionControl: false
  });

  function toLeafletPoint(x, y) {
    return L.latLng(imageHeight - y, x);
  }

  function createBounds(x1, y1, x2, y2) {
    return L.latLngBounds(
      toLeafletPoint(x1, y2),
      toLeafletPoint(x2, y1)
    );
  }

  const imageBounds = L.latLngBounds(
    [0, 0],
    [imageHeight, imageWidth]
  );

  L.imageOverlay(IMAGE_URL, imageBounds, {
    interactive: false
  }).addTo(map);

  map.fitBounds(imageBounds);

  function showClickedCoordinates(event) {
    const x = Math.round(event.latlng.lng);
    const y = Math.round(imageHeight - event.latlng.lat);

    console.log(`画像座標：x=${x}, y=${y}`);

    L.popup()
      .setLatLng(event.latlng)
      .setContent(`
        <strong>画像座標</strong><br>
        x = ${x}<br>
        y = ${y}
      `)
      .openOn(map);
  }

  map.on("click", showClickedCoordinates);

  includeMuseumData(function () {
    drawBooths(map, imageHeight, createBounds, showClickedCoordinates);
  });
}

function drawBooths(map, imageHeight, createBounds, showClickedCoordinates) {
  booths.forEach(function (booth) {
    const bounds = createBounds(
      booth.x1,
      booth.y1,
      booth.x2,
      booth.y2
    );

    const rectangle = L.rectangle(bounds, {
      className: "booth-area",
      color: DEBUG_MODE ? "#ff0000" : "#e83e8c",
      weight: DEBUG_MODE ? 2 : 0,
      opacity: DEBUG_MODE ? 1 : 0,
      fillColor: "#ffff00",
      fillOpacity: DEBUG_MODE ? 0.15 : 0,
      interactive: true,
      bubblingMouseEvents: true
    }).addTo(map);

    rectangle.bindTooltip(createTooltipHtml(booth), {
      className: "booth-tooltip",
      direction: "top",
      sticky: true,
      opacity: 1
    });

    rectangle.on("mouseover", function () {
      rectangle.setStyle({
        color: "#e83e8c",
        weight: 3,
        opacity: 1,
        fillColor: "#ffff00",
        fillOpacity: 0.35
      });

      rectangle.bringToFront();
    });

    rectangle.on("mouseout", function () {
      rectangle.setStyle({
        color: DEBUG_MODE ? "#ff0000" : "#e83e8c",
        weight: DEBUG_MODE ? 2 : 0,
        opacity: DEBUG_MODE ? 1 : 0,
        fillColor: "#ffff00",
        fillOpacity: DEBUG_MODE ? 0.15 : 0
      });
    });

    rectangle.on("click", function (event) {
      showClickedCoordinates(event);
      showBoothDetail(booth);
    });
  });
}

function createTooltipHtml(booth) {
  return `
    <div class="tooltip-content">
      <div class="tooltip-header">
        ブース ${escapeHtml(booth.id)}
      </div>

      <div class="tooltip-body">
        <p>
          <strong>${escapeHtml(booth.name)}</strong>
        </p>

        <p class="tooltip-category">
          分類：${escapeHtml(booth.category)}
        </p>

        <p>
          ${escapeHtml(booth.description)}
        </p>
      </div>
    </div>
  `;
}

function showBoothDetail(booth) {
  const detailElement = document.getElementById("selected-booth");

  detailElement.innerHTML = `
    <h2>
      ブース ${escapeHtml(booth.id)}
      ${escapeHtml(booth.name)}
    </h2>

    <p>
      <strong>分類：</strong>
      ${escapeHtml(booth.category)}
    </p>

    <p>
      ${escapeHtml(booth.description)}
    </p>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function includeMuseumData(callback) {
  const req = new XMLHttpRequest();

  req.open("get", "MuseumData.csv", true);
  req.send(null);

  req.onload = function () {
    convertCSVtoArray(req.responseText);
    setCoordinate();

    callback();
  };

  req.onerror = function () {
    console.error("MuseumData.csvを読み込めませんでした。");
  };
}

function convertCSVtoArray(str) {
  const lines = str.trim().split("\n");

  booths = [];

  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(",");

    booths.push({
      id: columns[0],
      name: columns[1],
      imgname: columns[2],
      description: columns[3],
      category: "展示"
    });
  }
}

/*
 * 画像左上基準のブース座標です。
 *
 * x1, y1：左上
 * x2, y2：右下
 */

function setCoordinate() {
  booths[0].x1 = 359;
  booths[0].y1 = 449;
  booths[0].x2 = 403;
  booths[0].y2 = 488;

  booths[1].x1 = 404;
  booths[1].y1 = 149;
  booths[1].x2 = 449;
  booths[1].y2 = 188;

  booths[2].x1 = 450;
  booths[2].y1 = 149;
  booths[2].x2 = 495;
  booths[2].y2 = 188;

  booths[3].x1 = 496;
  booths[3].y1 = 149;
  booths[3].x2 = 555;
  booths[3].y2 = 188;

  booths[4].x1 = 556;
  booths[4].y1 = 149;
  booths[4].x2 = 615;
  booths[4].y2 = 188;

  booths[5].x1 = 656;
  booths[5].y1 = 149;
  booths[5].x2 = 715;
  booths[5].y2 = 188;

  booths[6].x1 = 756;
  booths[6].y1 = 149;
  booths[6].x2 = 815;
  booths[6].y2 = 188;

  booths[7].x1 = 856;
  booths[7].y1 = 149;
  booths[7].x2 = 915;
  booths[7].y2 = 188;
}