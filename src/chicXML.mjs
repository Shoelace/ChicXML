
import * as styles from './chicXML.css'

// const sheet = new CSSStyleSheet();
// // Apply a rule to the sheet
// sheet.replaceSync('a { color: red; }');

// document.adoptedStyleSheets = [...document.adoptedStyleSheets,sheet];


// console.log(styles)
window.chicstyles = styles



export default class ChicXML extends HTMLElement {
  getstyleclass(stylename){
    if(styles[stylename])
      return styles[stylename]

    return stylename
  }
  constructor() {
    // Always call super first in constructor
    super();

    // console.log("in ChicXML constructor")
    // write element functionality in here

    if (this.hasAttribute("noshadow")){
    console.log("NOT using shadowdom")
    this.target = this
    }else{
    console.log("using shadowdom")
    this.target = this.attachShadow({ mode: 'open' });
      // clone template content nodes to the shadow DOM
      // shadowRoot.appendChild(template.content.cloneNode(true));
      let link = document.querySelector("link")
      if(link){
        // console.log("use link")
        this.target.appendChild(link.cloneNode(true));
      }

    }
    let s = document.createElement("span")
    s.className = this.getstyleclass("chicXML")
    this.target.appendChild ( s)

    // shadowRoot.adoptedStyleSheets = [sheet];


    // //TODO: see if there is a better way to do CSS
    //clone outer css
    // or embed

  }
  makeSpan(innerText, styleclass = undefined) {
    let span = document.createElement("span");
    span.innerText = innerText;

    if (styleclass != undefined)
      span.setAttribute("class", this.getstyleclass(styleclass));

    return span;
  }

  connectedCallback() {
    console.log('ChicXML  element added to page.');

    let embeddedxml = this.querySelector('xml')

    if (embeddedxml?.innerHTML) {
      // console.log( embeddedxml.innerHTML.trim())
      this.chicXML({ xmlString: embeddedxml.innerHTML.trim() });
      embeddedxml.remove() //remove text as it has been re-rendered inside teh shadow
    }else{
      console.warn("no xml child element")
    }

  }

  disconnectedCallback() {
    // console.log('ChicXML  element removed from page.');
  }

  adoptedCallback() {
    // console.log('ChicXML  element moved to new page.');
  }
  static get observedAttributes() {
    return ["collapsedText", "collapsedCount", "collapsedBelow"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
    console.log(name + " has changed from " + oldValue + " to " + newValue)
    // this.render()
  }


  addclicks() {
    let expanders = this.target.querySelector("span").querySelectorAll("."+this.getstyleclass("chicXML-expanderHeader"))
    // console.log(expanders)

    expanders.forEach(el => {
      // console.log("adding click to")
      // console.log(el)
      el.addEventListener('click', e => {

        let expander = el.querySelector("."+this.getstyleclass("chicXML-expander"))
        let content = el.parentElement.querySelector("."+this.getstyleclass("chicXML-content"))
        let collapsedText = el.parentElement.querySelector("."+this.getstyleclass("chicXML-collapsedText"))
        let closeExpander = el.parentElement.querySelector("."+this.getstyleclass("chicXML-expanderClose"))

        // console.log(expander)
        // console.log(content)
        // console.log(collapsedText)
        // console.log(closeExpander)
        // console.log(expander.classList)

        if (expander.classList.contains(this.getstyleclass("chicXML-expander-expanded"))) {
          // Already Expanded, therefore collapse time...
          expander.classList.remove(this.getstyleclass("chicXML-expander-expanded"))
          expander.classList.add(this.getstyleclass("chicXML-expander-collapsed"))

          collapsedText.setAttribute("style", "display: inline;");
          content.setAttribute("style", "display: none;");
          closeExpander.setAttribute("style", "display: none");

        }
        else {
          // Time to expand..
          expander.classList.add(this.getstyleclass("chicXML-expander-expanded"))
          expander.classList.remove(this.getstyleclass("chicXML-expander-collapsed"))

          collapsedText.setAttribute("style", "display: none;");
          content.setAttribute("style", "");
          closeExpander.setAttribute("style", "");
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

    // This is the easiest way to have default options.
    // let settings = $.extend({
    //   // These are the defaults.
    //   collapsedText: "...",
    //   collapsedCount: true,
    //   collapsedBelow: 3,
    // }, options);


    let settings = {
      // These are the defaults.
      collapsedText: this.getAttribute("collapsedText")  ||"...",
      collapsedCount: this.getAttribute("collapsedCount") ? (this.getAttribute("collapsedCount") === "true") : true,
      collapsedBelow: this.getAttribute("collapsedBelow" ) || 3,
      xmlString: options.xmlString
    };
    console.log("settings")
    console.log(settings)

    if (settings.xml == undefined && settings.xmlString == undefined)
      throw Error("No XML to be displayed was supplied")

    if (settings.xml != undefined && settings.xmlString != undefined)
      throw Error("Only one of xml and xmlString may be supplied")

    let xml = settings.xml;
    if (xml == undefined) {

      const parser = new DOMParser();
      xml = parser.parseFromString(settings.xmlString,"text/xml");
    }

    // return this.each(function () {

    // console.log("parent=")
    // console.log(this.target)
    // console.log(this.target.querySelector("span"))

    this.showNode(this.target.querySelector("span"), xml, settings);

    this.addclicks()

  }


  showNode(parent, xml, settings, currentDepth = 1) {
    if (xml.nodeType == 9) {
      for (const element of xml.childNodes)
        this.showNode(parent, element, settings, currentDepth + 1);

      return;
    }

    switch (xml.nodeType) {
      case 1: // chic element
        {
          const hasChildNodes = xml.childNodes.length > 0;
          const expandingNode = hasChildNodes && (xml.childNodes.length > 1 || xml.childNodes[0].nodeType != 3);

          const expanderHeader = expandingNode ? this.makeSpan("", "chicXML-expanderHeader") : parent;
          const startcollapsed = currentDepth > settings.collapsedBelow



          const expanderSpan = this.makeSpan("", "chicXML-expander");
          expanderHeader.appendChild(expanderSpan);

          if (expandingNode) {
            if (startcollapsed) {
              expanderSpan.classList.add(this.getstyleclass("chicXML-expander-collapsed"));
            }
            else {
              expanderSpan.classList.add(this.getstyleclass("chicXML-expander-expanded"));
            }

          }

          expanderHeader.appendChild(this.makeSpan("<", "chicXML-tagHeader"));
          expanderHeader.appendChild(this.makeSpan(xml.nodeName, "chicXML-tagValue"));

          if (expandingNode)
            parent.appendChild(expanderHeader);

          // Handle attributes
          let attributes = xml.attributes;
          for (const element of attributes) {
            let att = this.makeSpan(" ", "chicXML-attribute")
            att.appendChild(this.makeSpan(element.name, "chicXML-attrName"));
            att.appendChild(document.createTextNode('="'));
            att.appendChild(this.makeSpan(element.value, "chicXML-attrValue"));
            att.appendChild(document.createTextNode('"'));
            expanderHeader.appendChild(att)
          }

          // Handle child nodes
          if (hasChildNodes) {

            expanderHeader.appendChild(this.makeSpan(">", "chicXML-tagHeader"));

            if (expandingNode) {
              let ulElement = document.createElement("ul");
              for (const element of xml.childNodes) {
                let liElement = document.createElement("li");
                this.showNode(liElement, element, settings, currentDepth + 1);
                if (liElement.innerHTML) {
                  //add only if anything rendered
                  ulElement.appendChild(liElement);
                }
              }

              let collapsedTextSpan = this.makeSpan(settings.collapsedText, "chicXML-collapsedText");
              if (settings.collapsedCount && ulElement.childNodes.length > 0) {
                collapsedTextSpan.appendChild(this.makeSpan(ulElement.childNodes.length, 'chicXML-collapsedCount'))
                //collapsedTextSpan.innerText += "(" + ulElement.childNodes.length + ")"
              }
              ulElement.setAttribute("class", this.getstyleclass("chicXML-content"));
              parent.appendChild(collapsedTextSpan);
              parent.appendChild(ulElement);

              let closeExpander = parent.appendChild(this.makeSpan("", "chicXML-expanderClose"));


              if (startcollapsed) {
                collapsedTextSpan.setAttribute("style", "display: inline;");
                ulElement.setAttribute("style", "display: none;");
                closeExpander.setAttribute("style", "display: none");
              } else {
                collapsedTextSpan.setAttribute("style", "display: none;");
              }

            }
            else {
              parent.appendChild(this.makeSpan(xml.childNodes[0].nodeValue));
            }

            // Closing tag
            parent.appendChild(this.makeSpan("</", "chicXML-tagHeader"));
            parent.appendChild(this.makeSpan(xml.nodeName, "chicXML-tagValue"));
            parent.appendChild(this.makeSpan(">", "chicXML-tagHeader"));
          } else {
            //closing span
            expanderHeader.appendChild(this.makeSpan("/>", "chicXML-tagHeader"));
          }
        }
        break;

      case 3: // text
        {
          //only create text node if it has a value
          if (xml.nodeValue.trim() !== "") {
            parent.appendChild(this.makeSpan("", "chicXML-expander"));
            parent.appendChild(this.makeSpan(xml.nodeValue));
          }
        }
        break;

      case 4: // cdata
        {
          parent.appendChild(this.makeSpan("", "chicXML-expander"));
          parent.appendChild(this.makeSpan("<![CDATA[", "chicXML-tagHeader"));
          parent.appendChild(this.makeSpan(xml.nodeValue, "chicXML-cdata"));
          parent.appendChild(this.makeSpan("]]>", "chicXML-tagHeader"));
        }
        break;

      case 8: // comment
        {
          parent.appendChild(this.makeSpan("", "chicXML-expander"));
          parent.appendChild(this.makeSpan("<!--" + xml.nodeValue + "-->", "chicXML-comment"));
        }
        break;

      default:
        {
          let item = this.makeSpan("" + xml.nodeType + " - " + xml.name)
          parent.appendChild(item);
        }
        break;
    }


  }

}

customElements.define("chic-xml", ChicXML);
