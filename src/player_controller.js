import GameObject from './game_object';


export default class PlayerController extends GameObject {
  create() {
    this.cursors = this.game.input.keyboard.createCursorKeys();
    super.create();
  }

  frameUpdate(deltaTime) {
    if (this.lastJumpPress && this.game.time.now - this.lastJumpPress > 500)
      this.lastJumpPress = 0;

    if (!this.lastJumpPress) {
      this.isRequestingJump = this.cursors.up.isDown;
      if (this.isRequestingJump) this.lastJumpPress = this.game.time.now;
    }
    else if (this.cursors.up.isUp) {
      this.lastJumpPress = 0;
    }
    else {
      this.isRequestingJump = false;
    }

    if (this.cursors.left.isDown && !this.cursors.right.isDown)
      this.xPosition = -1;
    else if (this.cursors.right.isDown && !this.cursors.left.isDown)
      this.xPosition = 1;
    else
      this.xPosition = 0;

    super.frameUpdate(deltaTime);
  }
}
