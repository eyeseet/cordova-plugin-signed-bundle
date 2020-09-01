module.exports = function(context) {
	const APK_PATH = 'platforms\\android\\app\\build\\outputs\\apk\\release\\app-release-unsigned.apk';
	const AAB_PATH = 'platforms\\android\\app\\build\\outputs\\bundle\\release\\app-release.aab';
	
	if(!context.opts.platforms.includes('android')) {
		return;
	}
	if(!context.opts.options.release || 
		!(context.opts.options.sign || context.opts.options.bundle)) {
		return;
	}
	
	// Load modules
	var fs = require('fs');
	var path = require('path');	
	var process = require("child_process");
	
	var dependencyPath = path.join(context.opts.projectRoot, 'node_modules');
	var xml2js = require(path.join(dependencyPath, 'xml2js')).parseString;
	
	var xmlConfig = fs.readFileSync(path.join(context.opts.projectRoot, 'config.xml'));
	xml2js(xmlConfig, function(err, result) {
		if(err)
			console.error("Error reading config.xml while creating signed bundle", err);
	
		var pathToOutput = undefined;
		if(context.opts.options.bundle) {
			// create bundle
			pathToOutput = path.join(context.opts.projectRoot, AAB_PATH);
			process.execSync('gradlew bundleRelease', {
				cwd: path.join(context.opts.projectRoot, "platforms/android"),
				stdio: "inherit"
			});
		}
		else {
			// copy unsigned apk for signing
			var unsignedApk = path.join(context.opts.projectRoot, APK_PATH);
			pathToOutput = path.join(path.dirname(unsignedApk), 'app-release-signed.apk')
			fs.copyFileSync(unsignedApk, pathToOutput);
		}
		
		if(context.opts.options.sign) {
			// Read config
			var alias = undefined;
			var keystore = undefined;	
			result.widget.platform.forEach(function(platform) {
				if(platform.$.name == 'android') {
					platform.preference.forEach(function(pref) {
						if(pref.$.name == 'signed_bundle_keystore_path')
							keystore = pref.$.value;
						if(pref.$.name =='signed_bundle_keystore_alias')
							alias = pref.$.value;
					});
				}
			});
			
			if(keystore == undefined) {
				console.error("Preference signed_bundle_keystore_path must be defined in config.xml within <platform name=\"android\"></platform> tag.");
				return;
			}
			if(!path.isAbsolute(keystore))
				keystore = path.join(context.opts.projectRoot, keystore);
			
			// sign aab file
			process.execSync('jarsigner'+
				' -sigalg SHA1withRSA'+
				' -tsa http://timestamp.digicert.com'+
				' -digestalg SHA1'+
				' -keystore '+keystore+' '+
				pathToOutput+
				(alias != undefined ? ' '+alias: ''), 
				{
					cwd: context.opts.projectRoot,
					stdio: "inherit"
				} 
			);
		}
		
		
		console.log("created %s %s at %s",
			context.opts.options.sign ? 'signed' : 'unsigned',
			context.opts.options.bundle ? 'aab bundle' : 'apk', pathToOutput);
	});
	
	
}