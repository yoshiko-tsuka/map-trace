// グルーバル変数
var directionsDisplay;
var directionsService;
var map;
var marker_list;
var targetPosLat; //経路探索処理前に代入しておくこと
// targetPosLatは startCodeAddress(address);でセットされる 

//マーカーを管理するためのmarker_list
$(document).ready(function() {
    marker_list = new google.maps.MVCArray();

    directionsService = new google.maps.DirectionsService();
    geocoder = new google.maps.Geocoder();
    
});

// マーカーを指定した地点を覚えておく
function createMarker(map, latlng) {
    var marker = new google.maps.Marker();
    marker.setPosition(latlng);
    marker.setMap(map);
    return marker;
}

// マーカーの削除
function removeMarkers() {
    //setMap(null)を実行し、地図から削除
    if (marker_list !== undefined) {
        marker_list.forEach(function(marker, idx) {
          marker.setMap(null);
        });
    }
}

// 経路の最終地点を住所からGeocodingで取得し
// グローバル変数にセットするためのコールバック関数
function callbackTargetPosition(latlng) {
    targetPosLat = latlng;
}

// スタート地点をcodeAddress関数でgeocodingしたときに
// route描画の時に callbackで呼び出される関数
// google map Geocodingが非同期処理のため位置情報を得た後でなければ
// 経路探索できないため。
function callbackStartPosition(latlng) {
  var request = {
    origin: latlng,
    destination: targetPosLat,
    travelMode: 'WALKING',

  };
  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      directionsDisplay.setDirections(result);
    }
  });
  map.fitBounds(bounds);
  map.setZoom(map.getZoom() - 2);
}

// 行き先にマーカはセットする際,geoCodingしたいがtargetPosLatを変更したくない時に
// コールバック関数としてセットする
function callbackNone() {
}


// 処理を開始する前の初期化
function initialize() {
  removeMarkers();
    
  // ルート探索サービスをグローバル変数にセットしておく
  directionsDisplay = new google.maps.DirectionsRenderer(
  {
      suppressMarkers: true
      // 経路探索時のマーカーなし
  });
  //  var ginza = new google.maps.LatLng(35.6729463,139.7634783);
  var kanda = targetCodeAddress();
  var mapOptions = {
    zoom:17,
    center: kanda,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scaleControl: false,
  }

  
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsDisplay.setMap(map);
}

// google Map Geocodingで住所や、店舗名で緯度経度を得る
// ただし、google map geocodingは処理が非同期で実現されているので
// 注意すること
function codeAddress(address, callback) {
 var geocoder = new google.maps.Geocoder();
 if (geocoder) {
   geocoder.geocode( { 'address': address,'region': 'jp'},
    function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
    
       var bounds = new google.maps.LatLngBounds();
       for (var r in results) {
        if (results[r].geometry) {
            var latlng = results[r].geometry.location;
            bounds.extend(latlng);
            var marker = createMarker(map, latlng);
            marker_list.push(marker);
            infoWindow = new google.maps.InfoWindow({ // 吹き出しの追加
                content: "<div class='sample'>" + address + "</div>" // 吹き出しに表示する内容
            });
//            marker.addListener('click', function() { // マーカーをクリックしたとき
                 infoWindow.open(map, marker); // 吹き出しの表示
//            });  // addListnerのclickを外せば、常にinfowindowが表示される
            callback(latlng);
        }
       }
       }else{
        alert("Geocode 取得に失敗しました reason: "
             + status);
       }
      });
  }
}

// 開始地点の設定
function startCodeAddress(address) {
    return codeAddress(address, callbackStartPosition);
}

// 到着地点の設定と緯度経度をグローバル変数にセット
function targetCodeAddress() {
    return codeAddress('神田明神', callbackTargetPosition);
}

//  メニューの変更が行われたらルート探索を開始する
//  この処理の前にtargetCodeAddressで到着地点の緯度経度を取得しておくこと
function calcRoute() {
  $('#start option[value=""]').attr("disabled", true);
//  var directionsService = new google.maps.DirectionsService();
  var startpos = document.getElementById('start').value;
  if (startpos != "") {
      removeMarkers();
      codeAddress('神田明神', callbackNone);
      var start = startCodeAddress(startpos);
  }
}