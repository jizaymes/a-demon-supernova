ig.module(
	'plugins.pause-focus'
)
.requires(
	'impact.game'
)
.defines(function() {

	ig.Game.inject({

		staticInstantiate: function() {

			// https://gist.github.com/775473
			window.addEventListener("blur", function () {
				if (ig.system) {
					ig.music.stop();
					ig.system.stopRunLoop();
				}
			}, false);
			window.addEventListener("focus", function () {
				if (ig.system) {
					ig.music.play();
					ig.system.startRunLoop();
				}
			}, false);

			return this.parent();
		}

	});

});