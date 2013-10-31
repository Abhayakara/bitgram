This is a really trivial javascript hack that lets you type XML into
a field on the left, and see the packet you have described drawn as
ASCII art and as an HTML table on the right.   The HTML table format is
plagiarized from the wikipedia article on the IPv4 packet header.

The XML takes <bitgram>...</bitgram> at the top, with <field>...</field>
for each field in the packet.

The bitgram tag takes the following attributes:
  id: the ID of the tag.   This will also be the ID of the generated
      HTML table.
  width: the width in bits of the packet diagram.   Generally you want
         this to be 32.
The field tag takes the following attributes:
  name: the name that will appear for this field in the diagram.
  width: the width in bits of the field.   Can also be "variable"
	 for variable-width fields.
  stride: For variable-width fields, how many bits per element.

Obviously, this could do a lot more.
