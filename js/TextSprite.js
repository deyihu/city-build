

//default values
var OPTIONS1 = {
    fontSize: 20,
    altitude: 0,
    color: '#fff',
    text: 'hello',
    weight: 0,
    zoomFilter: false
};

/**
 * custom component
 * We can think of it as a point.
 * */

class TextSprite extends maptalks.BaseObject {
    constructor(coordinate, options, layer) {
        options = maptalks.Util.extend({}, OPTIONS1, options, { layer, coordinate });
        super();
        //Initialize internal configuration
        // https://github.com/maptalks/maptalks.three/blob/1e45f5238f500225ada1deb09b8bab18c1b52cf2/src/BaseObject.js#L135
        this._initOptions(options);
        const { altitude, fontSize, color, text } = options;


        //Initialize internal object3d
        // https://github.com/maptalks/maptalks.three/blob/1e45f5238f500225ada1deb09b8bab18c1b52cf2/src/BaseObject.js#L140
        this._createGroup();
        const textsprite = new THREE_Text2D.SpriteText2D(text, { align: THREE_Text2D.textAlign.center, font: `${fontSize * 2}px Arial`, fillStyle: color, antialias: false });
        textsprite.children[0].material.sizeAttenuation = false;
        const scale = 0.01 / 10 / 3;
        textsprite.scale.set(scale, scale, scale);
        this.getObject3d().add(textsprite);

        //set object3d position
        const z = layer.distanceToVector3(altitude, altitude).x;
        const position = layer.coordinateToVector3(coordinate, z);
        this.getObject3d().position.copy(position);
        this.textRect = {
            width: this.calTextWidth(text, fontSize),
            height: fontSize
        }

        this._vector = new THREE.Vector3();
        this._pixel = {
            x: 0,
            y: 0
        };
    }

    getTextRect() {
        this.getPixel();
        const { x, y } = this._pixel;
        const { width, height } = this.textRect;
        return {
            minX: x - width / 2,
            minY: y - height / 2,
            maxX: x + width / 2,
            maxY: y + height / 2
        }
    }

    calTextWidth(text, fontSize) {
        const chinese = text.match(/[\u4e00-\u9fa5]/g) || '';
        const chineseLen = chinese.length;
        const width = chineseLen * fontSize + (text.length - chineseLen) * 0.5 * fontSize;
        return width;
    }

    getPixel() {
        const size = this.getMap().getSize();
        const camera = this.getLayer().getCamera();
        const position = this.getObject3d().position;
        this._vector.x = position.x;
        this._vector.y = position.y;
        this._vector.z = position.z;
        this._pixel = simplepath.vector2Pixel(this._vector, size, camera);
    }

    identify(coordinate) {
        const { minX, minY, maxX, maxY } = this.getTextRect();
        const pixel = this.getMap().coordToContainerPoint(coordinate);
        if (pixel.x >= minX && pixel.x <= maxX && pixel.y >= minY && pixel.y <= maxY) {
            return true;
        }
        return false;
    }
}


var simplepath = {

    positionsConvert: function (worldPoints, altitude = 0, layer) {
        const vectors = [];
        for (let i = 0, len = worldPoints.length; i < len; i += 3) {
            let x = worldPoints[i], y = worldPoints[i + 1], z = worldPoints[i + 2];
            if (altitude > 0) {
                z += layer.distanceToVector3(altitude, altitude).x;
            }
            vectors.push(new THREE.Vector3(x, y, z));
        }
        return vectors;
    },

    vectors2Pixel: function (worldPoints, size, camera, altitude = 0, layer) {
        if (!(worldPoints[0] instanceof THREE.Vector3)) {
            worldPoints = simplepath.positionsConvert(worldPoints, altitude, layer);
        }
        const pixels = worldPoints.map(worldPoint => {
            return simplepath.vector2Pixel(worldPoint, size, camera);
        })
        return pixels;

    },

    vector2Pixel: function (world_vector, size, camera) {
        const vector = world_vector.project(camera);
        const halfWidth = size.width / 2;
        const halfHeight = size.height / 2;
        const result = {
            x: Math.round(vector.x * halfWidth + halfWidth),
            y: Math.round(-vector.y * halfHeight + halfHeight)
        };
        return result;
    },

};
