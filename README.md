This is a really trivial javascript hack that lets you type XML into
a field on the left, and see the packet you have described drawn as
ASCII art and as an HTML table on the right.   The HTML table format is
plagiarized from the wikipedia article on the IPv4 packet header.

The XML takes &lt;bitgram&rt;...&lt;/bitgram&rt; at the top, with 
&lt;field&rt;...&lt;/field&rt; for each field in the packet.

The bitgram tag takes the following attributes:
<dl>
  <dt>id</dt><dd>the ID of the tag.   This will also be the ID of the generated
      HTML table.</dd>
  <dt>width</dt><dd>the width in bits of the packet diagram.
    Generally you want this to be 32.</dd></dl>
The field tag takes the following attributes:
<dl>
  <dt>name</dt><dd>the name that will appear for this field in the diagram.</dd>
  <dt>width</dt><dd>the width in bits of the field.   Can also be "variable"
	 for variable-width fields.</dd>
  <dt>stride</dt><dd>For variable-width fields, how many bits per element.</dd>

Obviously, this could do a lot more.
