var core = document.querySelector('.core')
var foodWrap = document.querySelector('.food-wrap')
var snakeDom = document.querySelector('.snake')
var startMask = document.querySelector('.start-mask')
var start = document.querySelector('.start')
var controlMask = document.querySelector('.control-mask')
var control = document.querySelector('.control')
var audio = document.querySelector('.audio')
var lawn = document.querySelector('.lawn')
var wallTop = document.querySelector('.wall-top')
var wallBottom = document.querySelector('.wall-bottom')
var wallLeft = document.querySelector('.wall-left')
var wallRight = document.querySelector('.wall-right')
var speed = 160
var cellSize = 16
var maxCols = 24
var maxRows = 40

function resizeGame() {
  var titleHeight = 0
  var controlHeightV = 180
  var controlWidthH = 190
  var screenWidth = window.innerWidth
  var screenHeight = window.innerHeight
  var isLandscape = screenWidth > screenHeight

  var availableWidth, availableHeight
  if (isLandscape) {
    availableWidth = screenWidth - controlWidthH
    availableHeight = screenHeight - titleHeight
  } else {
    availableWidth = screenWidth
    availableHeight = screenHeight - titleHeight - controlHeightV
  }

  var wallThickness = 22
  var wallOverlap = 10
  var wallExtraX = wallOverlap * 2 + wallThickness * 2
  var wallExtraY = wallThickness * 2 + wallOverlap * 2

  var innerWidth = availableWidth - wallExtraX
  var innerHeight = availableHeight - wallExtraY

  var cols = Math.floor(innerWidth / cellSize)
  var rows = Math.floor(innerHeight / cellSize)

  maxCols = Math.max(10, Math.min(cols, 80))
  maxRows = Math.max(12, Math.min(rows, 100))

  var lawnWidth = maxCols * cellSize
  var lawnHeight = maxRows * cellSize

  var totalWidth = lawnWidth + wallExtraX
  var totalHeight = lawnHeight + wallExtraY
  var fillScale = Math.min(availableWidth / totalWidth, availableHeight / totalHeight)
  fillScale = Math.min(Math.max(fillScale, 1), 1.1)

  lawn.style.width = lawnWidth + 'px'
  lawn.style.height = lawnHeight + 'px'
  lawn.style.transform = 'scale(' + fillScale + ')'

  var topBottomWidth = lawnWidth + wallOverlap * 2
  var leftRightWidth = lawnHeight + wallOverlap * 2

  wallTop.style.width = topBottomWidth + 'px'
  wallBottom.style.width = topBottomWidth + 'px'

  wallLeft.style.width = leftRightWidth + 'px'
  wallLeft.style.left = -(leftRightWidth + wallThickness) + 'px'

  wallRight.style.width = leftRightWidth + 'px'
  wallRight.style.right = -(leftRightWidth + wallThickness) + 'px'
}

window.addEventListener('resize', resizeGame)
resizeGame()

function Factory(el, name, place, angle = 0) {
  var div = document.createElement('div')
  div.setAttribute('class', name)
  div.style.left = place[0] * cellSize + 'px'
  div.style.top = place[1] * cellSize + 'px'
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
    place[0] = Math.floor(Math.random() * maxCols)
    place[1] = Math.floor(Math.random() * maxRows)
    game.snake.info.forEach(v => {
      if (v[0] == place[0] && v[1] == place[1]) {
        console.log('食物在蛇身上', place, game.snake.info)
        place[0] = Math.floor(Math.random() * maxCols)
        place[1] = Math.floor(Math.random() * maxRows)
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
      if (this.snake.snakeHead.place[0] < 0 || this.snake.snakeHead.place[0] >= maxCols || this.snake.snakeHead.place[1] < 0 || this.snake.snakeHead.place[1] >= maxRows) {
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
      if (this.snake.snakeHead.place[0] < 0 || this.snake.snakeHead.place[0] >= maxCols || this.snake.snakeHead.place[1] < 0 || this.snake.snakeHead.place[1] >= maxRows) {
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
    this.snake = null
    this.food = null
  }
}
var game = new Game()
start.addEventListener('click', function () {
  startMask.style.display = 'none'
  game.init()
  try {
    audio.play()
  } catch (e) {
    console.log('Audio play failed:', e)
  }
})
core.addEventListener('click', function () {
  controlMask.style.display = 'block'
  game.stop()
  audio.pause()
})
control.addEventListener('click', function () {
  controlMask.style.display = 'none'
  game.continue()
  try {
    audio.play()
  } catch (e) {
    console.log('Audio play failed:', e)
  }
})

function setDirection(dir) {
  if (!game.snake || !game.snake.snakeHead) return
  var cur = game.snake.snakeHead.direction
  if (dir == 'left' && cur != 'right') {
    game.snake.snakeHead.direction = 'left'
  } else if (dir == 'top' && cur != 'bottom') {
    game.snake.snakeHead.direction = 'top'
  } else if (dir == 'right' && cur != 'left') {
    game.snake.snakeHead.direction = 'right'
  } else if (dir == 'bottom' && cur != 'top') {
    game.snake.snakeHead.direction = 'bottom'
  }
}

var directionBtns = document.querySelectorAll('.direction-btn')
var holdTimer = null
directionBtns.forEach(function (btn) {
  function startHold(e) {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    var dir = this.getAttribute('data-dir')
    setDirection(dir)
    if (holdTimer) clearInterval(holdTimer)
    holdTimer = setInterval(function () {
      setDirection(dir)
    }, 50)
  }
  function endHold(e) {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (holdTimer) {
      clearInterval(holdTimer)
      holdTimer = null
    }
  }
  btn.addEventListener('touchstart', startHold, { passive: false })
  btn.addEventListener('touchend', endHold, { passive: false })
  btn.addEventListener('touchmove', function (e) {
    e.preventDefault()
    e.stopPropagation()
  }, { passive: false })
  btn.addEventListener('touchcancel', endHold, { passive: false })
  btn.addEventListener('mousedown', startHold)
  btn.addEventListener('mouseup', endHold)
  btn.addEventListener('mouseleave', endHold)
  btn.addEventListener('click', function (e) {
    e.preventDefault()
    e.stopPropagation()
  })
})

var touchStartX = 0
var touchStartY = 0
var minSwipeDistance = 30
var swipeBlocked = false

document.addEventListener('touchstart', function (e) {
  if (e.target.closest && e.target.closest('.direction-pad')) {
    swipeBlocked = true
    return
  }
  swipeBlocked = false
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}, { passive: false })

document.addEventListener('touchmove', function (e) {
  if (e.target.closest && e.target.closest('.direction-pad')) {
    e.preventDefault()
  }
}, { passive: false })

document.addEventListener('touchend', function (e) {
  if (swipeBlocked) return
  if (!game.snake || !game.snake.snakeHead) return
  var touchEndX = e.changedTouches[0].clientX
  var touchEndY = e.changedTouches[0].clientY
  var deltaX = touchEndX - touchStartX
  var deltaY = touchEndY - touchStartY

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0 && game.snake.snakeHead.direction != 'left') {
        game.snake.snakeHead.direction = 'right'
      } else if (deltaX < 0 && game.snake.snakeHead.direction != 'right') {
        game.snake.snakeHead.direction = 'left'
      }
    }
  } else {
    if (Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0 && game.snake.snakeHead.direction != 'top') {
        game.snake.snakeHead.direction = 'bottom'
      } else if (deltaY < 0 && game.snake.snakeHead.direction != 'bottom') {
        game.snake.snakeHead.direction = 'top'
      }
    }
  }
})

