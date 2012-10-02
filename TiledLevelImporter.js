(function() {

  Crafty.c("TiledLevel", {

    makeTiles: function(ts, drawType) {

      var components, i, posx, posy, sMap, sName, tHeight, tName, tNum, tWidth, tsHeight,
        tsImage, tsProperties, tsWidth, xCount, yCount, _ref, rect;
      tsImage = ts.image, tNum = ts.firstgid, tsWidth = ts.imagewidth;
      tsHeight = ts.imageheight, tWidth = ts.tilewidth, tHeight = ts.tileheight;
      tsProperties = ts.tileproperties;
      xCount = tsWidth / tWidth | 0;
      yCount = tsHeight / tHeight | 0;
      sMap = {};

      // loop through tilset tiles
      for (i = 0, _ref = yCount * xCount; i < _ref; i += 1) {
        posx = i % xCount;
        posy = i / xCount | 0;
        sName = "tileSprite" + tNum;
        tName = "tile" + tNum;
        sMap[sName] = [posx, posy];
        rect = [];

        components = "2D, " + sName + ", MapTile, Collision";

        if (tsProperties && tsProperties[i]) {
          if (tsProperties[i]["components"]) {
            components += ", " + tsProperties[i]["components"];
          } // components
          //collision rect in the form of "rect":"x,y,w,h"
          if (tsProperties[i]["rect"]) {
            var rectstr = tsProperties[i]["rect"].split(",");
            for(var rr=0; rr<rectstr.length; rr++) { rect[rr] = +rectstr[rr]; }
          } // rect
        } // if tile properties

        // register Crafty component that is this unique tiletype
        Crafty.c(tName, {
          comp: components,
          cRect: rect,
          init: function() {
            this.addComponent(this.comp);
            return this;
          }
        });
        tNum++;
      } // loop tileset tiles

      Crafty.sprite(tWidth, tHeight, tsImage, sMap);
      return null;

    }, // makeTiles()

    makeLayer: function(layer, drawType) {

      // make sure it's actually a tilelayer
      if (layer.type == "tilelayer") {
        var i, lData, lHeight, lWidth, tDatum, tile, _len;
        lData = layer.data, lWidth = layer.width, lHeight = layer.height;

        for (i = 0, _len = lData.length; i < _len; i++) {
          if (lData[i] == null)
            continue;

          tDatum = lData[i];

          if (drawType != null)
            tile = Crafty.e(drawType + ", tile" + tDatum);
          else
            tile = Crafty.e("tile" + tDatum);

          tile.x = (i % lWidth) * tile.w;
          tile.y = (i / lWidth | 0) * tile.h;
          tile.z = layer.level;

          if( tile.cRect != null && tile.cRect.length == 4) {
            var c = tile.cRect;
            tile.collision([c[0],c[1]],[c[0]+c[2],c[1]],[c[0]+c[2],c[1]+c[3]],[c[0],c[1]+c[3]]);
          } // add collision 'rect' as quad
        } // loop data
      } // if type is 'tilelayer'
      return null;
    }, // makeLayer()

    tiledLevel: function(levelURL, drawType) {
      var _this = this;
      $.ajax({
        type: 'GET',
        url: levelURL,
        dataType: 'json',
        data: {},
        async: false,

        success: function(level) {

          var lLayers, ts, tsImages, tss;
          lLayers = level.layers, tss = level.tilesets;
          drawType = drawType != null ? drawType : "Canvas";

          tsImages = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = tss.length; _i < _len; _i++) {
              ts = tss[_i];
              _results.push(ts.image);
            }
            return _results;
          })(); // list images

          Crafty.load(tsImages, function() {
            var layer, ts, _i, _j, _len, _len2;
            for (_i = 0, _len = tss.length; _i < _len; _i++) {
              ts = tss[_i];
              _this.makeTiles(ts, drawType);
            }
            for (_j = 0, _len2 = lLayers.length; _j < _len2; _j++) {
              layer = lLayers[_j];
              layer.level = _j;
              // if the layer is not visible, don't give it a drawtype
              _this.makeLayer(layer, layer.visible?drawType:null);
            }
            return null;
          }); // load images

          return null;
        } // ajax success
      }); // ajax request
      return this;
    }, // tiledLevel()

    init: function() {
      return this;
    } // init()
  });

}).call(this);
