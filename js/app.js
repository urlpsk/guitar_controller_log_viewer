const vm = Vue.createApp({
    data() {
        return {
            gamePad: null,
            frameItems: [],
            buttonRed: '4',
            buttonGreen: '3',
            buttonBlue: '2',
            buttonYellow: '1',
            buttonPurple: '0',
            pickUp: '11',
            pickDown: '12',
            beforePick: '',
            frameHeight: 7,
            laneHeight: 500,
            reverse: false,
            transparent: 1,
            url: '',
        }
    },
    methods: {
        init: function () {
            this.setSettingsFromUrl();
            this.itemReset();
            (function loop() {
                vm.gamePad = navigator.getGamepads()[0];
                if (!vm.gamePad || vm.isAnyButtonSettingEmpty()) {
                    requestAnimationFrame(loop);
                    return;
                }

                const frameData = [];

                //button
                let isOpen = true;
                for (const buttonName in vm.buttonMap) {
                    const isPressed = vm.gamePad.buttons[vm.buttonMap[buttonName]].pressed;
                    frameData.push(isPressed);
                    if (isPressed) {
                        isOpen = false;
                    }
                }
                frameData.push(isOpen);

                //pick
                let anyPicked = false;
                for (const pickName in vm.pickMap) {
                    const isPressed = vm.gamePad.buttons[vm.pickMap[pickName]].pressed;
                    const isSamePick = vm.beforePick === pickName;
                    const isPickActive = isPressed && !isSamePick;
                    frameData.push(isPickActive);
                    if (isPressed) {
                        vm.beforePick = pickName;
                        anyPicked = true;
                        break;
                    }
                }
                if (!anyPicked) {
                    vm.beforePick = "";
                }

                if (vm.reverse) {
                    vm.frameItems.unshift(frameData);
                    vm.frameItems.pop();
                } else {
                    vm.frameItems.push(frameData);
                    vm.frameItems.shift();
                }

                requestAnimationFrame(loop);
            }());
        },
        itemReset: function () {
            //rgbyp, open, up, down,
            /*
            vm.frameItems = [
                [1,1,1,1,1,0,1,0],
                [0,0,0,0,0,1,0,1],
                [1,1,1,0,0,0,0,0],
                [0,1,0,0,1,0,1,0],
                [0,0,0,1,0,0,0,1],
                [0,0,0,0,0,1,0,0],
                [0,0,0,0,0,1,1,0],
                [0,0,0,0,0,1,0,1],
                [1,0,0,0,0,0,0,0],
            ]
            */
            vm.frameItems = Array.from(Array(vm.frameNumber), () => [0, 0, 0, 0, 0, 0, 0, 0]);
            this.displayUrl();
        },
        inputPreset: function (presets) {
            [vm.buttonRed, vm.buttonGreen, vm.buttonBlue, vm.buttonYellow, vm.buttonPurple, vm.pickUp, vm.pickDown] = presets;
            this.displayUrl();
        },
        setSettingsFromUrl: function () {
            const url = new URL(window.location);
            const params = new URLSearchParams(url.search);
            for (const [k, v] of params) {
                switch (k) {
                    case 's':
                        vm.frameHeight = v;
                        break;
                    case 'r':
                        vm.reverse = v == 1;
                        break;
                    case 'h':
                        vm.laneHeight = v;
                        break;
                    case 't' :
                        vm.transparent = v;
                        break;
                    case 'b':
                        [vm.buttonRed, vm.buttonGreen, vm.buttonBlue, vm.buttonYellow, vm.buttonPurple] = v.split(',');
                        break;
                    case 'p':
                        [vm.pickUp, vm.pickDown] = v.split(',')
                        break;
                }
            }
        },
        displayUrl: function () {
            const params = [
                's=' + vm.frameHeight,
                'r=' + (vm.reverse ? 1 : 0),
                'h=' + vm.laneHeight,
                't=' + vm.transparent,
                'b=' + [vm.buttonRed, vm.buttonGreen, vm.buttonBlue, vm.buttonYellow, vm.buttonPurple].join(','),
                'p=' + [vm.pickUp, vm.pickDown].join(','),
            ];
            //GETパラメータを除外して追加
            vm.url = window.location.toString().replace(window.location.search, '') + '?' + params.join('&');
            history.replaceState(null, null, vm.url);
        },
        isAnyButtonSettingEmpty: function () {
            return [vm.buttonRed, vm.buttonGreen, vm.buttonBlue, vm.buttonYellow, vm.buttonPurple, vm.pickUp, vm.pickDown]
                .filter(item => {
                    return item === '';
                }).length > 0;
        },
    },
    computed: {
        frameNumber: function () {
            return Math.ceil(parseFloat(this.laneHeight) / this.frameHeight);
        },
        buttonMap: function () {
            return {
                'red': this.buttonRed,
                'green': this.buttonGreen,
                'blue': this.buttonBlue,
                'yellow': this.buttonYellow,
                'purple': this.buttonPurple,
            };
        },
        pickMap: function () {
            return {
                'up_pick': this.pickUp,
                'down_pick': this.pickDown,
            };
        },
        laneWidth: function () {
            return 245;
        },
        lifetime: function () {
            return Math.round(1000.0 / 60 * this.frameNumber);
        },
        laneBackgroundColor: function () {
            return 'rgba(0,0,0,' + (100 - this.transparent) * 0.01 + ')';
        },
        css: function () {
            return 'body{ background-color: transparent; overflow: hidden;}';
        },
    },
}).mount('#app');

vm.init();