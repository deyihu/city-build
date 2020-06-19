maptalks.ThreeLayer.prototype.texts = [];
maptalks.ThreeLayer.prototype.rbush = new RBush();
maptalks.ThreeLayer.prototype.collides = function () {
    this.rbush.clear();
    for (let i = 0, len = this.texts.length; i < len; i++) {
        const text = this.texts[i];
        const textRect = text.getTextRect();
        if (this.rbush.collides(textRect)) {
            text.hide();
        } else {
            text.show();
            this.rbush.insert(textRect);
        }
    }
}


maptalks.ThreeLayer.prototype.toText = function (coordinate, options) {
    return new TextSprite(coordinate, options, this);
}


// @Override
maptalks.ThreeLayer.prototype._zoomend = function () {
    const scene = this.getScene();
    if (!scene) {
        return;
    }
    const zoom = this.getMap().getZoom();
    scene.children.forEach(mesh => {
        const parent = mesh.__parent;
        if (parent && parent.getOptions) {
            if (!parent.getOptions().zoomFilter) {
                return;
            }
            const minZoom = parent.getMinZoom(), maxZoom = parent.getMaxZoom();
            if ((zoom < minZoom || zoom > maxZoom) && parent.isVisible()) {
                parent.hide();
            } else if (minZoom <= zoom && zoom <= maxZoom && (!parent.isVisible())) {
                parent.show();
            }
        }
    });
}

// @Override
maptalks.ThreeLayer.prototype.addMesh = function (meshes, render = true) {
    if (!meshes) return this;
    if (!Array.isArray(meshes)) {
        meshes = [meshes];
    }
    const scene = this.getScene();
    meshes.forEach(mesh => {
        if (mesh instanceof maptalks.BaseObject) {
            scene.add(mesh.getObject3d());
            if (!mesh.isAdd) {
                mesh.isAdd = true;
                mesh._fire('add', { target: mesh });
                if (mesh instanceof TextSprite) {
                    this.texts.push(mesh);
                    const textRect = mesh.getTextRect();
                    if (threeLayer.rbush.collides(textRect)) {
                        mesh.hide();
                    } else {
                        mesh.show();
                        threeLayer.rbush.insert(textRect);
                    }
                }
            }
            if (mesh._animation && maptalks.Util.isFunction(mesh._animation)) {
                this._animationBaseObjectMap[mesh.getObject3d().uuid] = mesh;
            }
        } else if (mesh instanceof THREE.Object3D) {
            scene.add(mesh);
        }
    });
    this._zoomend();
    // sort by weight
    this.texts.sort(function (text1, text2) {
        return text2.getOptions().weight - text1.getOptions().weight;
    });
    this.collides();
    if (render) {
        this.renderScene();
    }
    return this;
}

/**
 * remove object3ds
 * @param {BaseObject} meshes
 */
// @Override
maptalks.ThreeLayer.prototype.removeMesh = function (meshes, render = true) {
    if (!meshes) return this;
    if (!Array.isArray(meshes)) {
        meshes = [meshes];
    }
    const scene = this.getScene();
    meshes.forEach(mesh => {
        if (mesh instanceof maptalks.BaseObject) {
            scene.remove(mesh.getObject3d());
            if (mesh.isAdd) {
                mesh.isAdd = false;
                mesh._fire('remove', { target: mesh });
                if (mesh instanceof TextSprite) {
                    for (let i = 0, len = this.texts.length; i < len; i++) {
                        if (mesh === this.texts[i]) {
                            this.texts.splice(i, 1);
                            break;
                        }
                    }
                }
            }
            if (mesh._animation && maptalks.Util.isFunction(mesh._animation)) {
                delete this._animationBaseObjectMap[mesh.getObject3d().uuid];
            }
        } else if (mesh instanceof THREE.Object3D) {
            scene.remove(mesh);
        }
    });
    // sort by weight
    this.texts.sort(function (text1, text2) {
        return text2.getOptions().weight - text1.getOptions().weight;
    });
    this.collides();
    if (render) {
        this.renderScene();
    }
    return this;
}
