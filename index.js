var fs = require('fs');
var path = require('path');

var GitHubApi = require('github');

var config = {
	user: 'half-ogre',
	repo: 'rpg-lunch',
	path: '/star-wars',
	output: 'output'
};

if (!fs.existsSync(config.output)) {
	fs.mkdirSync(config.output);
}

var github = new GitHubApi({
    version: '3.0.0',
    headers: {
        'user-agent': 'drewify'
    }
});

github.repos.getContent(
	{
		user: config.user,
		repo: config.repo,
		path: config.path
	},
	function (err, res) {
		if (err) throw err;
		res.forEach(function (file, index) {
			getRawCharacterFile(file);
		});
	});

function getRawCharacterFile(file) {
	console.log('retrieving ' + file.path);
	github.repos.getContent(
		{
			user: config.user,
			repo: config.repo,
			path: file.path
		},
		function (err, res) {
			if (err) throw err;
			if (res.encoding !== 'base64') throw new Error('Unexpected encoding: ' + res.encoding);
			var buffer = new Buffer(res.content, 'base64');
			renderRawCharacterFile(file, buffer.toString());
		});
}

function renderRawCharacterFile(meta, source) {

	var outputPath = path.join(config.output, meta.name + '.html');
	console.log(outputPath);

	github.markdown.renderRaw({
		data: source
	},
		function (err, res) {
			fs.writeFile(outputPath, res, function (err) {
				if (err) throw err;
				console.dir(res);
			});
		});
}