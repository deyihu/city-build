const OPTIONS = {
    interactive: false,
    altitude: 0,

}
class Ground extends maptalks.BaseObject {
    constructor(coordinate, options, material, layer) {
        options = maptalks.Util.extend({}, OPTIONS, options, { layer, coordinate });
        super();
        //Initialize internal configuration
        // https://github.com/maptalks/maptalks.three/blob/1e45f5238f500225ada1deb09b8bab18c1b52cf2/src/BaseObject.js#L135
        this._initOptions(options);
        const { altitude } = options;
        //generate geometry

        const geometry = new THREE.PlaneBufferGeometry(200, 200);

        //Initialize internal object3d
        // https://github.com/maptalks/maptalks.three/blob/1e45f5238f500225ada1deb09b8bab18c1b52cf2/src/BaseObject.js#L140
        this._createMesh(geometry, material);

        //set object3d position
        const z = layer.distanceToVector3(altitude, altitude).x;
        const position = layer.coordinateToVector3(coordinate, z);
        this.getObject3d().position.copy(position);
        this.getObject3d().receiveShadow = true;
    }
}