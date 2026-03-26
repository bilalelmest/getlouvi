(function() {
  var script = document.currentScript;
  var id = script.getAttribute('data-id');
  var widget = script.getAttribute('data-widget') || 'grid';
  var theme = script.getAttribute('data-theme') || 'light';
  var container = document.getElementById('louvi-widget');
  if (!container) {
    container = script.parentElement;
    var div = document.createElement('div');
    div.id = 'louvi-widget';
    container.insertBefore(div, script);
    container = div;
  }
  var height = widget === 'badge' ? '250' : '500';
  var origin = script.src.replace('/embed.js', '');
  var iframe = document.createElement('iframe');
  iframe.src = origin + '/wall/' + id + '?widget=' + widget + '&theme=' + theme;
  iframe.width = '100%';
  iframe.height = height;
  iframe.frameBorder = '0';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '14px';
  iframe.style.overflow = 'hidden';
  container.appendChild(iframe);
})();
