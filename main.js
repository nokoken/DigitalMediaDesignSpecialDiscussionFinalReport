"use strict";

const IMAGE_URL = "./img/Map.png";

/*
 * trueにすると、ブースの当たり判定を赤枠で表示します。
 * 位置調整が終わったらfalseにしてください。
 */
const DEBUG_MODE = false;

/*
 * 画像左上基準のブース座標です。
 *
 * x1, y1：左上
 * x2, y2：右下
 */
const booths = [
  {
    id: "54",
    name: "株式会社インテック",
    category: "べんり",
    description: "業務を便利にするサービスをご紹介します。",
    x1: 359,
    y1: -449,
    x2: 403,
    y2: -488
  },
  {
    id: "55",
    name: "株式会社コスモテック",
    category: "べんり",
    description: "各種業務支援サービスを展示しています。",
    x1: 404,
    y1: 149,
    x2: 449,
    y2: 188
  },
  {
    id: "56",
    name: "株式会社コミュニケーションサービス",
    category: "べんり",
    description: "コミュニケーション関連製品をご案内します。",
    x1: 450,
    y1: 149,
    x2: 495,
    y2: 188
  },
  {
    id: "57",
    name: "有限会社展示企画",
    category: "べんり",
    description: "展示会向けの企画サービスです。",
    x1: 496,
    y1: 149,
    x2: 555,
    y2: 188
  },
  {
    id: "58",
    name: "株式会社展示技研",
    category: "べんり",
    description: "技術を活用した便利な商品をご紹介します。",
    x1: 556,
    y1: 149,
    x2: 615,
    y2: 188
  }
];

/*
 * 画像を先に読み込み、実際の画像サイズを取得します。
 */
const image = new Image();

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

  /*
   * クリック位置を表示する共通関数
   */
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

  /*
   * 地図部分をクリック
   */
  map.on("click", showClickedCoordinates);

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

    /*
     * ブース部分をクリック
     */
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