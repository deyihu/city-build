//default values
var OPTIONS2 = {
    altitude: 0,
    interactive: false
};

/**
 * custom Circle component
 * 
 * you can customize your own components
 * */

class Sky extends maptalks.BaseObject {
    constructor(coordinate, options, material, layer) {
        options = maptalks.Util.extend({}, OPTIONS2, options, { layer, coordinate });
        super();
        //Initialize internal configuration
        // https://github.com/maptalks/maptalks.three/blob/1e45f5238f500225ada1deb09b8bab18c1b52cf2/src/BaseObject.js#L135
        this._initOptions(options);

        //Initialize internal object3d
        // https://github.com/maptalks/maptalks.three/blob/1e45f5238f500225ada1deb09b8bab18c1b52cf2/src/BaseObject.js#L140
        this._createGroup();


        var sky = this.sky = new THREE.Sky();
        sky.scale.setScalar(100000000);
        // sky.rotation.x = -Math.PI;
        this.getObject3d().add(sky);

        var uniforms = sky.material.uniforms;

        uniforms['turbidity'].value = 100.29;
        uniforms['rayleigh'].value = 4.75;
        uniforms['mieCoefficient'].value = 0.005;
        uniforms['mieDirectionalG'].value = 0.8;

        this.pmremGenerator = new THREE.PMREMGenerator(layer.getThreeRenderer());
        this.sun = new THREE.Vector3();
        this.parameters = {
            inclination: 0.50,
            azimuth: 0.205
        };
        //set object3d position

        // const z = layer.distanceToVector3(altitude, altitude).x;
        // const position = layer.coordinateToVector3(coordinate, z);
        // this.getObject3d().position.copy(position);

        this.updateSun(layer);
    }



    updateSun(layer) {
        layer = layer || this.getLayer();

        const { sky, pmremGenerator, sun, parameters } = this;
        var theta = Math.PI * (parameters.inclination - 0.5);
        var phi = 2 * Math.PI * (parameters.azimuth - 0.5);

        sun.x = Math.cos(phi);
        sun.y = Math.sin(phi) * Math.sin(theta);
        sun.z = Math.sin(phi) * Math.cos(theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);
        // water.material.uniforms['sunDirection'].value.copy(sun).normalize();
        layer.getScene().environment = pmremGenerator.fromScene(sky).texture;

    }

}
