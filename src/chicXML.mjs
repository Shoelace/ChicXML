'use strict'


import * as chicXmlStyles from './chicXML.module.css' assert { type: 'css' }

// console.log(chicXmlStyles)
//using this function we can access the css classnames even if they have been mangled
function getStyle(style) {
  //check if style has been "packed"
  if (style in chicXmlStyles) {
    return chicXmlStyles[style]
  }
  return style
}

//only need to do this once
if ('default' in chicXmlStyles && (typeof chicXmlStyles.default) == "object") {
  //append stylesheet to global styles
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, chicXmlStyles.default]
}


class ChicXML extends HTMLElement {



  constructor() {
    // Always call super first in constructor
    super()


    /// define noshadow if you want to style teh xml yourself
    if (this.hasAttribute("noshadow")) {
      this.target = this

    } else {
      this.target = this.attachShadow({ mode: 'open' })
      if ('default' in chicXmlStyles && (typeof chicXmlStyles.default) == "object") {
        this.target.adoptedStyleSheets = [chicXmlStyles.default]
      }

    }

    let s = document.createElement("span")
    s.className = getStyle('chicXml')
    this.target.appendChild(s)

  }
  makeSpan(innerText, styleclass = undefined) {
    let span = document.createElement("span")
    span.innerText = innerText

    if (styleclass != undefined)
      span.setAttribute("class", styleclass)

    return span
  }

  connectedCallback() {
    let embeddedxml = this.querySelector('script')
    if (embeddedxml?.innerHTML && embeddedxml.innerHTML.trim().length > 0) {
      this.chicXML({ xmlString: embeddedxml.innerHTML.trim() })
      embeddedxml.remove() //remove text as it has been re-rendered inside teh shadow
    } else {
      //check if it has already been rendered
      if (!this.target.querySelector(`.${getStyle('chicXml')}`)) {
        //if not then warn
        console.warn("no xml in child script element")
      }
    }

  }

  // disconnectedCallback() {
  //   // console.log('ChicXML  element removed from page.')
  // }

  // adoptedCallback() {
  //   // console.log('ChicXML  element moved to new page.')
  // }
  static get observedAttributes() {
    return ["collapsedText", "collapsedCount", "collapsedBelow"]
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
    // console.log(name + " has changed from " + oldValue + " to " + newValue)
    //TODO: do somethign with teh value
  }


  addclicks() {
    let expanders = this.target.querySelector("span").querySelectorAll(`.${getStyle('chicXmlExpanderHeader')}`)
    // console.log(expanders)

    expanders.forEach(el => {
      // console.log("adding click to")
      // console.log(el)
      el.addEventListener('click', e => {

        let expander = el.querySelector(`.${getStyle('chicXmlExpander')}`)
        let content = el.parentElement.querySelector(`.${getStyle('chicXmlContent')}`)
        let collapsedText = el.parentElement.querySelector(`.${getStyle('chicXmlCollapsedText')}`)
        let closeExpander = el.parentElement.querySelector(`.${getStyle('chicXmlExpanderClose')}`)

        // console.log(expander)
        // console.log(content)
        // console.log(collapsedText)
        // console.log(closeExpander)
        // console.log(expander.classList)

        if (expander.classList.contains(getStyle('chicXmlExpanderExpanded'))) {
          // Already Expanded, therefore collapse time...
          expander.classList.remove(getStyle('chicXmlExpanderExpanded'))
          expander.classList.add(getStyle('chicXmlExpanderCollapsed'))

          collapsedText.setAttribute("style", "display: inline")
          content.setAttribute("style", "display: none")
          closeExpander.setAttribute("style", "display: none")

        }
        else {
          // Time to expand..
          expander.classList.add(getStyle('chicXmlExpanderExpanded'))
          expander.classList.remove(getStyle('chicXmlExpanderCollapsed'))

          collapsedText.setAttribute("style", "display: none")
          content.setAttribute("style", "")
          closeExpander.setAttribute("style", "")
        }

      })
    })


  }
  // Additional features that are needed
  //
  // allow specification of how attributes are shown

  // Data Model:
  //
  //   One of the following must be supplied
  //      xml                 - the XML object to be shown
  //      xmlString           - the XML string to be shown
  //
  //   Options:
  //      collapsedText       - the text shown when the node is collapsed. Defaults to '...'
  //      collapsedCount      - display count of collapsed nodes after collapsedText eg. '...(4)'
  //      collapsedBelow      - nested depth when nodes are collapsed by deafult
  chicXML(options) {


    let settings = {
      // These are the defaults.
      collapsedText: this.getAttribute("collapsedText") || "...",
      collapsedCount: this.getAttribute("collapsedCount") ? (this.getAttribute("collapsedCount") === "true") : true,
      collapsedBelow: this.getAttribute("collapsedBelow") || 3,
      xmlString: options.xmlString
    }

    if (settings.xml == undefined && settings.xmlString == undefined)
      throw Error("No XML to be displayed was supplied")

    if (settings.xml != undefined && settings.xmlString != undefined)
      throw Error("Only one of xml and xmlString may be supplied")

    let xml = settings.xml
    if (xml == undefined) {

      const parser = new DOMParser()
      xml = parser.parseFromString(settings.xmlString, "text/xml")
    }

    this.showNode(this.target.querySelector("span"), xml, settings)

    this.addclicks()

  }


  showNode(parent, xml, settings, currentDepth = 1) {
    if (xml.nodeType == 9) {
      for (const element of xml.childNodes)
        this.showNode(parent, element, settings, currentDepth + 1)

      return
    }

    switch (xml.nodeType) {
      case 1: // chic element
        {
          const hasChildNodes = xml.childNodes.length > 0
          const expandingNode = hasChildNodes && (xml.childNodes.length > 1 || xml.childNodes[0].nodeType != 3)

          const expanderHeader = expandingNode ? this.makeSpan("", getStyle('chicXmlExpanderHeader')) : parent
          const startcollapsed = currentDepth > settings.collapsedBelow



          const expanderSpan = this.makeSpan("", getStyle('chicXmlExpander'))
          expanderHeader.appendChild(expanderSpan)

          if (expandingNode) {
            expanderSpan.classList.add(startcollapsed ? getStyle('chicXmlExpanderCollapsed') : getStyle('chicXmlExpanderExpanded'))
          }

          expanderHeader.appendChild(this.makeSpan("<", getStyle('chicXmlTagHeader')))
          expanderHeader.appendChild(this.makeSpan(xml.nodeName, getStyle('chicXmlTagValue')))

          if (expandingNode)
            parent.appendChild(expanderHeader)

          // Handle attributes
          let attributes = xml.attributes
          for (const element of attributes) {
            let att = this.makeSpan(" ", getStyle('chicXmlAttribute'))
            att.appendChild(this.makeSpan(element.name, getStyle('chicXmlAttrName')))
            att.appendChild(document.createTextNode('="'))
            att.appendChild(this.makeSpan(element.value, getStyle('chicXmlAttrValue')))
            att.appendChild(document.createTextNode('"'))
            expanderHeader.appendChild(att)
          }

          // Handle child nodes
          if (hasChildNodes) {

            expanderHeader.appendChild(this.makeSpan(">", getStyle('chicXmlTagHeader')))

            if (expandingNode) {
              let ulElement = document.createElement("ul")
              for (const element of xml.childNodes) {
                let liElement = document.createElement("li")
                this.showNode(liElement, element, settings, currentDepth + 1)
                if (liElement.innerHTML) {
                  //add only if anything rendered
                  ulElement.appendChild(liElement)
                }
              }

              let collapsedTextSpan = this.makeSpan(settings.collapsedText, getStyle('chicXmlCollapsedText'))
              if (settings.collapsedCount && ulElement.childNodes.length > 0) {
                collapsedTextSpan.appendChild(this.makeSpan(ulElement.childNodes.length, getStyle('chicXmlCollapsedCount')))
                //collapsedTextSpan.innerText += "(" + ulElement.childNodes.length + ")"
              }
              ulElement.setAttribute("class", getStyle('chicXmlContent'))
              parent.appendChild(collapsedTextSpan)
              parent.appendChild(ulElement)

              let closeExpander = parent.appendChild(this.makeSpan("", getStyle('chicXmlExpanderClose')))


              if (startcollapsed) {
                collapsedTextSpan.setAttribute("style", "display: inline")
                ulElement.setAttribute("style", "display: none")
                closeExpander.setAttribute("style", "display: none")
              } else {
                collapsedTextSpan.setAttribute("style", "display: none")
              }

            }
            else {
              parent.appendChild(this.makeSpan(xml.childNodes[0].nodeValue))
            }

            // Closing tag
            parent.appendChild(this.makeSpan("</", getStyle('chicXmlTagHeader')))
            parent.appendChild(this.makeSpan(xml.nodeName, getStyle('chicXmlTagValue')))
            parent.appendChild(this.makeSpan(">", getStyle('chicXmlTagHeader')))
          } else {
            //closing span
            expanderHeader.appendChild(this.makeSpan("/>", getStyle('chicXmlTagHeader')))
          }
        }
        break

      case 3: // text
        {
          //only create text node if it has a value
          if (xml.nodeValue.trim() !== "") {
            parent.appendChild(this.makeSpan("", getStyle('chicXmlExpander')))
            parent.appendChild(this.makeSpan(xml.nodeValue))
          }
        }
        break

      case 4: // cdata
        {
          parent.appendChild(this.makeSpan("", getStyle('chicXmlExpander')))
          parent.appendChild(this.makeSpan("<![CDATA[", getStyle('chicXmlTagHeader')))
          parent.appendChild(this.makeSpan(xml.nodeValue, getStyle('chicXmlCdata')))
          parent.appendChild(this.makeSpan("]]>", getStyle('chicXmlTagHeader')))
        }
        break

      case 8: // comment
        {
          parent.appendChild(this.makeSpan("", getStyle('chicXmlExpander')))
          parent.appendChild(this.makeSpan("<!--" + xml.nodeValue + "-->", getStyle('chicXmlComment')))
        }
        break

      default:
        {
          let item = this.makeSpan("" + xml.nodeType + " - " + xml.name)
          parent.appendChild(item)
        }
        break
    }


  }

}

customElements.define("chic-xml", ChicXML)

//declare all exports
export { ChicXML, chicXmlStyles }
export default ChicXML