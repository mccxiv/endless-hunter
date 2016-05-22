export default class CameraManager {
  constructor(game) {
    this._game = game;
    this._sprite = null;
    this._cameraPos = null;
    this._lerp = 0.02;
  }
    
  setSprite(sprite) {
    this._sprite = sprite;
    this._cameraPos = {x: sprite.position.x, y: sprite.position.y};
  }
  
  updatePosition() {
    if (!this._sprite) return;
    const player = this._sprite.position;
    this._cameraPos.x += (player.x - this._cameraPos.x) * this._lerp;
    this._cameraPos.y += (player.y - this._cameraPos.y) * this._lerp;
    this._game.camera.focusOnXY(this._cameraPos.x, this._cameraPos.y);
  }
}
