async function migrateSettings() {
	function olderVersion(a, comp) {
		let r = /(\d+)\.(\d+)\.(\d+)/;
		let va = r.exec(a);
		let vcomp = r.exec(comp);

		for (var i = 1; i < 4; i++) {
			if (va[i] < vcomp[i]) {
				return true;
			}
		}

		return false;
	}

	function setDefaults(config) {
		let defaults = {
			light_theme: true
			, regex_over_wildcard: false
			, rules: []
			, regex_nextId: 0
			, use_tst_indent: false
			, use_tst_tree_close: false
			, ftt: false
			, use_panel_numkey: false
			, panorama_css: ""
			, popup_css: ""
		}

		for (var key in defaults) {
			config[key] = config[key] == null ? defaults[key] : config[key];
		}
	}

	let config = await browser.storage.local.get();
	let manifest = await browser.runtime.getManifest();

	if (config.version == null) {
		setDefaults(config);
		config.firstInstall = manifest.version;
		config.version = manifest.version;
	}

	if (config.firstInstall == "0.13.8") {
		config.salvage_debug_info = null;

		for (rule in config.rules) {
			rule.matchUrl = true;
		}
	}

	if (olderVersion(config.version, "0.15.0")) {
		if (config.rules == null) {
			config.rules = [];
		}

		if (config.rules.length == 0) {
			config.regex_over_wildcard = false;
			config.regex_nextId = 0;
		}
		else {
			config.regex_over_wildcard = true;
			config.regex_nextId = config.rules.length;

			for (let i = 0; i < config.rules.length; i++) {
				config.rules[i].id = i;
				config.rules[i].lastEdit = 1;
			}
		}
	}

	if (olderVersion(config.version, "0.16.0")) {
		delete config[`use_tst_context`];
	}

	if (olderVersion(config.version, "1.0.0")) {
		setDefaults(config);
	}

	config.version = manifest.version;
	await browser.storage.local.set(config);
}