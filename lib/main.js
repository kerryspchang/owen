const argv = require('argv'),
      colors = require('colors'),
      columnify = require('columnify'),
      expandHomeDir = require('expand-home-dir'),
      propertiesParser = require('properties-parser'),
      wskprops = propertiesParser.read(expandHomeDir('~/.wskprops')),
      ow = require('openwhisk')({
	  apihost: wskprops.APIHOST || 'openwhisk.ng.bluemix.net',
	  api_key: wskprops.AUTH,
	  namespace: wskprops.NAMESPACE || '_'
      }),
      options = argv.option([
	  {name: 'kind', short: 'k', type: 'string', description: 'View only a selected kind of entity: rule, action, sequence'},
	  // {name: 'all', short: 'a', type: 'string', description: 'Show all entities'},
	  {name: 'wide', short: 'w', type: 'string', description: 'Widen the columns'},
	  {name: 'full-width', short: 'f', type: 'string', description: 'Use full-width columns'},
      ]).run().options

/**
 * Pretty printers
 *
 */
const deleted = name => `!!(${name})`.red.dim
const pp = name => name && name.substring(name.lastIndexOf('/') + 1)
const pps = action => !action.exec || action.exec.kind !== 'sequence' ? pp(action.name) || deleted(action)
      : action.exec.components
            .slice(1)
            .reduce((S, c) => `${S} -> ${pp(c)}`, pp(action.exec.components[0])).green
const ppf = (feed, trigger) => feed ? pp(feed).blue + `(${trigger.name})` : trigger.name || deleted(trigger)
const ppt = trigger => ppf(((trigger.annotations || []).find(a => a.key === 'feed') || { value: '' }).value, trigger)

/**
 * Turn an array into a map
 *
 */
const toMap = L => L.reduce((M, entity) => { M[entity.name] = entity; return M; }, {})

/**
 * Form an openwhisk entity query
 *
 */
const query = (entity, kind) => {
    const Q = {}
    Q[(kind || 'action') + 'Name'] = entity.name
    Q.namespace = entity.namespace

    return Q
}

/**
 * Perform an openwisk "get" call on the entities in a given list L
 *
 */
const getAll = (L, kind) => {
    return Promise.all(L.map(entity => ow[(kind || 'action') + 's'].get(query(entity, kind))))
}

/**
 * This is the main view generator
 *
 */
const view = (triggers, actions, rules) => {
    getAll(triggers, 'trigger')
	.then(triggers => getAll(rules, 'rule')
	      .then(rules => getAll(actions)
		    .then(actions => {
			var triggerMap = toMap(triggers)
			var actionMap = toMap(actions)
			var data = []
    
			rules.forEach(rule => {
			    data.push({
				structure: `${ppt(triggerMap[rule.trigger] || rule.trigger)} => ` + pps(actionMap[rule.action] || rule.action),
				type: 'rule'.reset,
				name: rule.name
			    })

			    delete actionMap[rule.action]
			})

			for (var actionName in actionMap) {
			    const action = actionMap[actionName]
			    if (action.exec.kind === 'sequence') {
				data.push({
				    structure: pps(action),
				    type: 'sequence'.reset,
				    name: action.name
				})
			    }
			}

			const columnOpts = { minWidth: 6, truncate: true }
			if (!options['full-width']) {
			    columnOpts.maxWidth = options.wide ? 80 : 40
			}
			console.log(columnify(data, columnOpts))
		    })))
}

/**
 * Process the command line options, and then fetch data and invoke
 * the viewer as appropriate
 *
 */
function main() {
    const listOptions = { limit: options.limit || 20 }
    
    if (options.kind) {
	switch (options.kind) {
	case 'actions':
	    return ow.actions.list(listOptions)
		.then(actions => view([], actions, []))
	case 'rules':
	    return ow.rules.list(listOptions)
		.then(rules =>
		      ow.triggers.list(listOptions)
		      .then(triggers => view(triggers, [], rules)))
	}
    } else {
	ow.actions.list(listOptions)
	    .then(actions => ow.rules.list(listOptions)
		  .then(rules => ow.triggers.list(listOptions)
			.then(triggers => view(triggers, actions, rules))))
    }
}

module.exports.main = main
