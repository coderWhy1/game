var core = document.querySelector('.core')
var foodWrap = document.querySelector('.food-wrap')
var snakeDom = document.querySelector('.snake')
var startMask = document.querySelector('.start-mask')
var start = document.querySelector('.start')
var controlMask = document.querySelector('.control-mask')
var control = document.querySelector('.control')
var audio = document.querySelector('.audio')
var speed = 160
function Factory(el, name, place, angle = 0) {
  var div = document.createElement('div')
  div.setAttribute('class', name)
  div.style.left = place[0] * 20 + 'px'
  div.style.top = place[1] * 20 + 'px'
  if (angle) {
    div.style.transform = "rotate(" + angle + "deg)"
  }
  el.insertBefore(div, el.children[0])
  this.remove = function () {
    if (div) {
      el.removeChild(div)
      div = null
    } else {
      el.children.length && el.removeChild(el.children[el.children.length - 1])
    }
  }
}
function Snake() {
  var snakeEnd = new Factory(snakeDom, 'snake-end', [0, 0])
  var snakeBody = new Factory(snakeDom, 'snake-body', [1, 0])
  var snakeHead = new Factory(snakeDom, 'snake-head', [2, 0])
  this.snakeHead = {
    direction: 'right',
    place: [2, 0],
    angle: 0
  }
  this.info = [[2, 0], [1, 0], [0, 0]]
  this.move = function () {
    this.updateInfo()
    this.info.pop()
    snakeEnd.remove()
  }
  this.eat = function () {
    this.updateInfo()
  }
  this.die = function (timer) {
    clearInterval(timer)
    game.fraction = (this.info.length - 3) * 10
    alert('游戏结束\n您的得分:' + game.fraction + '分')
    game.reset()
  }
  this.nextPlace = function () {
    var x = this.snakeHead.place[0]
    var y = this.snakeHead.place[1]
    switch (this.snakeHead.direction) {
      case 'top':
        y = y - 1
        this.snakeHead.angle = -90
        break;
      case 'bottom':
        y = y + 1
        this.snakeHead.angle = 90
        break;
      case 'left':
        x = x - 1
        this.snakeHead.angle = 180
        break;
      case 'right':
        x = x + 1
        this.snakeHead.angle = 0
        break;
    }
    return [x, y]
  }
  this.updateInfo = function () {
    snakeHead.remove()
    snakeBody = new Factory(snakeDom, 'snake-body', this.info[0])
    this.snakeHead.place = this.nextPlace()
    snakeHead = new Factory(snakeDom, 'snake-head', this.snakeHead.place, this.snakeHead.angle)
    this.info.forEach(v => {
      if (v[0] == this.snakeHead.place[0] && v[1] == this.snakeHead.place[1]) {
        console.log('咬到身体了')
        return this.die(this.timer)
      }
    });
    this.info.unshift(this.snakeHead.place)
  }
}
function Food() {
  this.place = [10, 10]
  var food = new Factory(foodWrap, 'food', this.place)
  this.create = function () {
    var place = []
    place[0] = Math.ceil(Math.random() * 35)
    place[1] = Math.ceil(Math.random() * 35)
    game.snake.info.forEach(v => {
      if (v[0] == place[0] && v[1] == place[1]) {
        console.log('食物在蛇身上', place, game.snake.info)
        place[0] = Math.ceil(Math.random() * 35)
        place[1] = Math.ceil(Math.random() * 35)
      }
    })
    this.remove()
    this.place = place
    food = new Factory(foodWrap, 'food', this.place)
  }
  this.remove = function () {
    food.remove()
  }
}
function Game() {
  this.timer = null
  this.snake = null
  this.food = null
  this.fraction = 0
  this.init = function () {
    this.snake = new Snake()
    this.food = new Food()
    this.timer = setInterval(() => {
      this.snake.move()
      if (this.snake.snakeHead.place[0] < 0 || this.snake.snakeHead.place[0] > 35 || this.snake.snakeHead.place[1] < 0 || this.snake.snakeHead.place[1] > 35) {
        console.log('撞墙了')
        return this.snake.die(this.timer)
      } else if (this.snake.snakeHead.place[0] == this.food.place[0] && this.snake.snakeHead.place[1] == this.food.place[1]) {
        //吃食物
        this.snake.eat()
        this.food.remove()
        this.food.create()
      }
    }, speed)
    this.snake.timer = this.timer
    var that = this
    document.addEventListener("keydown", function (event) {
      if (event.keyCode == 37 && that.snake.snakeHead.direction != 'right') {
        that.snake.snakeHead.direction = 'left'
      } else if (event.keyCode == 38 && that.snake.snakeHead.direction != 'bottom') {
        that.snake.snakeHead.direction = 'top'
      } else if (event.keyCode == 39 && that.snake.snakeHead.direction != 'left') {
        that.snake.snakeHead.direction = 'right'
      } else if (event.keyCode == 40 && that.snake.snakeHead.direction != 'top') {
        that.snake.snakeHead.direction = 'bottom'
      }
      event.preventDefault();
    });
  }
  this.stop = function () {
    clearInterval(this.timer)
  }
  this.continue = function () {
    this.timer = setInterval(() => {
      this.snake.move()
      if (this.snake.snakeHead.place[0] < 0 || this.snake.snakeHead.place[0] > 35 || this.snake.snakeHead.place[1] < 0 || this.snake.snakeHead.place[1] > 35) {
        console.log('撞墙了')
        return this.snake.die(this.timer)
      } else if (this.snake.snakeHead.place[0] == this.food.place[0] && this.snake.snakeHead.place[1] == this.food.place[1]) {
        //吃食物
        this.snake.eat()
        this.food.remove()
        this.food.create()
      }
    }, speed)
  }
  this.reset = function () {
    snakeDom.innerHTML = null
    foodWrap.innerHTML = null
    startMask.style.display = 'block'
  }
}
var game = new Game()
start.addEventListener('click', function () {
  startMask.style.display = 'none'
  game.init()
  audio.play()
})
core.addEventListener('click', function () {
  controlMask.style.display = 'block'
  game.stop()
  audio.pause()
})
control.addEventListener('click', function () {
  controlMask.style.display = 'none'
  game.continue()
  audio.play()
})

