function checkValid(str)
{
  var xmlBody = "<bitgrams>" + str + "</bitgrams>";
  var doc = null;
  if (window.DOMParser)
  {
    var parser = new DOMParser();
    doc = parser.parseFromString(xmlBody, "text/xml");
  }
  else
  {
    doc = new ActiveXObject("Microsoft.XMLDOM");
    doc.async = true;
    doc.loadXML(xmlBody);
  }
  var top = doc.childNodes;
  if (top.length != 1)
  {
    console.log("impossible: bitgrams length is 1.\n");
    return true;
  }
  var asciiArt = parseBitgrams(top[0].childNodes, bitgramsToAsciiArt);
  if (asciiArt == null)
  {
    return true;
  }
  var midCol = document.getElementById("clm2");
  var midChildren = midCol.childNodes;
  for (var i = midChildren.length; i > 0; i--)
  {
    midCol.removeChild(midChildren[i - 1]);
  }
  var codeNode = document.createElement("pre");
  codeNode.innerHTML = asciiArt;
  midCol.appendChild(codeNode);

  var table = parseBitgrams(top[0].childNodes, bitgramsToTable);
  if (table == null)
  {
    return true;
  }
  var lastCol = document.getElementById("clm3");
  lastCol.innerHTML = table;

  return true;
}

function parseBitgrams(bitgrams, bitgramsFunc)
{
  var bitgramFunc = bitgramsFunc();

  for (var i = 0; i < bitgrams.length; i++)
  {
    var node = bitgrams[i];
    if (node.nodeType == 3)
    {
      var data = node.data;
      data = data.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      if (data != "")
      {
	console.log("non-empty text element in top level.\n");
	return null;
      }
      continue;
    }
    else if (node.nodeType == 1)
    {
      if (node.nodeName != "bitgram")
      {
	console.log("unknown node when expecting bitgram: " + node.nodeName);
	return null;
      }
    }
    else if (node.nodeType == 8)
    {
      continue;
    }
    else
    {
      console.log("unexpected node type: " + node.nodeType.toString());
      return null;
    }

    var nodeId = null;
    var width = 32;
    var attrs = node.attributes;
    for (var j = 0; j < attrs.length; j++)
    {
      if (attrs[j].nodeName == "id")
	nodeId = attrs[j].nodeValue;
      else if (attrs[j].nodeName == "width")
      {
	width = parseInt(attrs[j].nodeValue);
	if (isNaN(width))
	{
	  console.log("invalid width for bitgram: " + attrs[j].nodeValue);
	  return;
	}
      }
      else
      {
	console.log("unknown attribute: " + attrs[j].nodeName);
      }
    }
    bitgramFunc(node.childNodes, nodeId, width);
  }
  return bitgramFunc(null, null, null);
}

function parseFields(nodes, id, gramWidth, fieldsFunc)
{
  var fieldFunc = fieldsFunc(nodes, id, gramWidth);

  for (var i = 0; i < nodes.length; i++)
  {
    var node = nodes[i];
    if (node.nodeType == 3)
    {
      var data = node.data;
      data = data.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      if (data != "")
      {
	console.log("non-empty text element |" + data + "| in bitgram: " + id);
	return null;
      }
      continue;
    }
    else if (node.nodeType == 1)
    {
      if (node.nodeName != "field")
      {
	console.log("unknown node when expecting field: " + node.nodeName);
	return null;
      }
    }
    else if (node.nodeType == 8)
    {
      continue;
    }
    else
    {
      console.log("unexpected node type: " + node.nodeType.toString());
      return null;
    }

    var name = null;
    var width = 32;
    var stride = 0;
    var big = false;
    var value = null;
    var attrs = node.attributes;
    for (var j = 0; j < attrs.length; j++)
    {
      if (attrs[j].nodeName == "name")
	name = attrs[j].nodeValue;
      else if (attrs[j].nodeName == "value")
	value = attrs[j].nodeValue;
      else if (attrs[j].nodeName == "big" && attrs[j].nodeValue == "true")
	big = true;
      else if (attrs[j].nodeName == "width")
      {
	if (attrs[j].nodeValue == "variable")
	  width = "variable";
	else
	{
	  width = parseInt(attrs[j].nodeValue);
	  if (width != "variable" && isNaN(width))
	  {
	    console.log("invalid width for bitgram field: " +
			attrs[j].nodeValue);
	    return;
	  }
	}
      }
      else if (attrs[j].nodeName == "stride")
      {
	stride = parseInt(attrs[j].nodeValue);
	if (isNaN(stride))
	{
	  console.log("invalid stride for bitgram field: " +
		      attrs[j].nodeValue);
	  return;
	}
      }
      else
      {
	console.log("unknown attribute: " + attrs[j].nodeName);
      }
      if (value == null)
	value = name;
      if (stride == null)
	stride = width;
    }
    fieldFunc(name, value, big, width, stride);
  }
  return fieldFunc(null, null, null, null, null);
}

function bitgramsToAsciiArt()
{
  var rv = "";

  return function(fields, nodeId, width)
  { 
    if (fields == null)
    {
      if (rv == "")
      {
	console.log("no bitgrams.");
	return null;
      }
      return rv;
    }
    rv = rv + "    ";
    for (var j = 0; j < width; j++)
    {
      if ((j & 7) == 0)
	rv = rv + "+-";
      else
	rv = rv + "--";
    }
    rv = rv + "+\n    ";
    for (var j = 0; j < width; j++)
    {
      if ((j & 7) == 0)
	rv = rv + "|"
      else
	rv = rv + " ";
      rv = rv + (j & 7).toString();
    }
    rv = rv + "|\n";

    var subrv = parseFields(fields, nodeId, width, fieldsToAsciiArt);
    if (subrv == null)
      return null;
    rv = rv + subrv + "\n\n";
  };
}

function fieldsToAsciiArt(nodes, id, gramWidth)
{
  var rv = "    ";
  var line1 = "    ";
  var line2 = "    ";
  var spaces = "";

  for (i = 0; i < gramWidth; i++)
  {
    if ((i & 7) == 0)
    {
      rv += '+-';
    }
    else
      rv += '--';
    spaces += "  ";
  }
  rv += '+\n';

  var at = 0;

  return function(name, value, big, width, stride)
  {
    if (name == null)
    {
      if (line2 != "    ")
      {
	rv = (rv +
	      line2.substring(0, lim) + "|\n" +
	      line1.substring(0, lim) + "+\n");
      }
      
      if (rv == "")
      {
	console.log("no bitgrams.");
	return null;
      }
      return rv;
    }

    console.log("name = " + name +
		"  value = " + value +
		"  big = " + big.toString() +
		"  width = " + width.toString() +
		"  stride = " + stride.toString());

    var remain = 0;
    var lim;
    var end = "|";
    if (width == "variable")
    {
      if (at != 0)
      {
	remain = gramWidth;
	middle = "~";
	end = ":";
      }
      else
      {
	remain = 0;
      }
      lim = gramWidth;
    }
    else
    {
      if (gramWidth - at < width)
      {
	remain = width - (gramWidth - at);
	lim = gramWidth;
      }
      else
      {
	remain = 0;
	lim = at + width;
      }
    }

    while (at != lim)
    {
      var off = rv.length;
      off -= 2; // the newline and terminating mark
      off -= gramWidth * 2; // back to the beginning of the line
      off += at * 2; // forward to current position.
      rv = rv.substr(0, off) + "+" + rv.substr(off + 1);

      var space = (lim - at) * 2;
      if (name.length + 1 < space)
      {
	var ava = (space - name.length - 1);
	line2 += "|";
	if (ava & 1)
	{
	  line2 += " ";
	  ava -= 1;
	}
	ava = ava >> 1;
	line2 += spaces.substr(0, ava) + name + spaces.substr(0, ava);
      }
      else
      {
	line2 += "|" + name.substr(0, space - 1);
      }

      for (var j = at; j < lim; j++)
      {
	if (j < remain)
	{
	  if (j == 0 || j == at)
	    line1 += "+ "
	  else
	    line1 += "  ";
	}
	else
	{
	  if (j == 0 || j == at || j == remain)
	    line1 += "+-";
	  else
	    line1 += "--";
	}
      }

      if (lim == gramWidth)
      {
	rv = rv + line2 + end + "\n" + line1 + "+\n";
	line2 = "    ";
	line1 = "    ";
	at = 0;
      }
      else
      {
	at = lim;
      }
      if (remain >= gramWidth)
      {
	remain -= (gramWidth);
	lim = gramWidth;
	if (end == "~")
	  end = ":";
      }
      else if (remain)
      {
	lim = remain;
	remain = 0;
      }
      else
      {
	lim = at;
      }
    }
  };
}

function bitgramsToTable()
{
  var rv = "";

  return function(fields, nodeId, width)
  { 
    if (fields == null)
    {
      if (rv == "")
      {
	console.log("no bitgrams.");
	return null;
      }
      return rv;
    }

    var subrv = parseFields(fields, nodeId, width, fieldsToTable);
    if (subrv == null)
      return null;
    rv = rv + subrv + "\n\n";
  };
}

function fieldsToTable(nodes, id, gramWidth)
{
  var bitwidth = (((84 / gramWidth * 10) | 0) / 10).toString();
  var rv = "<table class='bitgram-table' id='" + id + "'>\n";
  var bitoff = 0;
  var octoff = 0;

  rv += "  <tbody class='bitgram-tbody'\n";
  rv += "  <tr>\n";
  rv += "    <th class='offsets'>Offsets</th>\n";
  rv += "    <th class='left-octet'>Octet</th>\n";

  for (var i = 0; i < gramWidth >> 3; i++)
  {
    rv += "    <th colspan='8' class='octet'>" + i.toString() + "</th>\n";
  }
  rv += "  </tr>\n";
  rv += "  <tr>\n";
  rv += "    <th class='top-octet'>Octet</th>\n";
  rv += "    <th class='bit-label'>Bit</th>\n";
  for (var i = 0; i < gramWidth; i++)
  {
    rv += ("    <th style='width:" +
	   bitwidth + "%' class='bit'>" + i.toString() + "</th>\n");
  }

  var at = 0;

  return function(name, value, big, width, stride)
  {
    if (name == null)
    {
      if (at != 0)
      {
	if (at != gramWidth)
	{
	  rv += ("    <td class='blank-field' colspan='" +
		 (gramWidth - at).toString() +
		 "'></td>\n");
	}
	rv += "  </tr>\n";
	rv += "  </tbody>\n";
	rv += "</table>\n";
      }
      
      return rv;
    }

    var remain = 0;
    var lim;
    if (width == "variable")
    {
      if (at != 0)
      {
	remain = gramWidth;
      }
      else
      {
	remain = 0;
      }
      lim = gramWidth;
    }
    else
    {
      if (gramWidth - at < width)
      {
	remain = width - (gramWidth - at);
	lim = gramWidth;
      }
      else
      {
	remain = 0;
	lim = at + width;
      }
    }

    while (at != lim)
    {
      if (at == 0)
      {
	rv += "  <tr>\n";
	rv += "    <th class='octet-offset'>" + octoff.toString() + "</th>\n";
	rv += "    <th class='bit-offset'>" + bitoff.toString() + "</th>\n";
	bitoff += gramWidth;
	octoff += (gramWidth >> 3);
      }
      var space = (lim - at).toString();
      rv += ("    <td class='field' colspan='" + space +
	     "'>" + name + "</td>\n");

      if (lim == gramWidth)
      {
	rv += "  </tr>\n";
	at = 0;
      }
      else
      {
	at = lim;
      }
      if (remain >= gramWidth)
      {
	remain -= (gramWidth);
	lim = gramWidth;
      }
      else if (remain)
      {
	lim = remain;
	remain = 0;
      }
      else
      {
	lim = at;
      }
    }
  };
}


// Local Variables:
// mode:Javascript
// js-class-style:"gnu"
// end:
