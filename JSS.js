function createElement(ElementName,ElementType,SetParent,Attributes,NS){"use strict";if(Attributes==null){Attributes=[];}
let AttributeKeys=Object.keys(Attributes);if(SetParent==null){return null;}else{if(typeof SetParent==="string"||typeof SetParent==="number"){SetParent=document.getElementById(SetParent);}}
let NewElement,StyleApply="",i;if(NS==null){NewElement=document.createElement(ElementType);}else{NewElement=document.createElementNS(NS,ElementType);}
if(SetParent===null){document.body.appendChild(NewElement);}else{SetParent.appendChild(NewElement);}
for(i=0;i<AttributeKeys.length;i+=1){StyleApply=StyleApply+AttributeKeys[i]+": "+Attributes[AttributeKeys[i]]+"; ";}
NewElement.setAttribute("style",StyleApply);NewElement.setAttribute("id",ElementName);return NewElement;}
function setCSS(ElementName,Attribute,NewValue){"use strict";if(ElementName==null){return null;}else{if(typeof ElementName==="string"||typeof ElementName==="number"){ElementName=document.getElementById(ElementName);}}
let Element=ElementName,OriginalStyle=Element.getAttribute("style").split("; "),FoundAttribute=false,i,p,ReapplyStyle="",CurrentCheck,FirstPart,SecondPart;OriginalStyle.pop();for(i=0;i<OriginalStyle.length;i+=1){CurrentCheck="|| "+OriginalStyle[i]+" ||";FirstPart=CurrentCheck.split("|| ").pop().split(": ")[0];SecondPart=CurrentCheck.split(": ").pop().split(" ||")[0];if(FirstPart===Attribute){OriginalStyle[i]=Attribute+": "+NewValue;FoundAttribute=true;}}
if(FoundAttribute===false){OriginalStyle.push(Attribute+": "+NewValue);}
for(p=0;p<OriginalStyle.length;p+=1){ReapplyStyle=ReapplyStyle+OriginalStyle[p]+"; ";}
Element.setAttribute("style",ReapplyStyle);}
function removeCSS(Element,Attribute){if(typeof Element=="string"){Element=document.getElementById(Element);}
let OriginalStyle=Element.getAttribute("style").split("; ");OriginalStyle.pop();for(i=0;i<OriginalStyle.length;i+=1){CurrentCheck="|| "+OriginalStyle[i]+" ||";FirstPart=CurrentCheck.split("|| ").pop().split(": ")[0];SecondPart=CurrentCheck.split(": ").pop().split(" ||")[0];if(FirstPart===Attribute){OriginalStyle[i]="";}}
let ReapplyStyle="";for(p=0;p<OriginalStyle.length;p+=1){if(OriginalStyle[p]!=""){ReapplyStyle=ReapplyStyle+OriginalStyle[p]+"; ";}}
Element.setAttribute("style",ReapplyStyle);}
function getCSS(ElementName,Attribute){"use strict";if(ElementName==null){return null;}else{if(typeof ElementName==="string"||typeof ElementName==="number"){ElementName=document.getElementById(ElementName);}}
let Element=ElementName,OriginalStyle=Element.getAttribute("style").split("; "),i,CurrentCheck,FirstPart,SecondPart;if(OriginalStyle.length<2){return "";}
if(OriginalStyle[OriginalStyle-1]==""){OriginalStyle.pop();}
for(i=0;i<OriginalStyle.length;i+=1){CurrentCheck="|| "+OriginalStyle[i]+" ||";FirstPart=CurrentCheck.split("|| ").pop().split(": ")[0];SecondPart=CurrentCheck.split(": ").pop().split(" ||")[0];if(FirstPart===Attribute){return SecondPart;}}
if(Element&&Element.currentStyle){return Element.currentStyle[Attribute];}
else if(Element&&window.getComputedStyle){return document.defaultView.getComputedStyle(Element,null).getPropertyValue(Attribute);}}
function find(ElementName){"use strict";return document.getElementById(ElementName);}
function findClass(ClassName){"use strict";return document.getElementsByClassName(ClassName);}
function ranInt(Min,Max){"use strict";return Math.floor(Math.random()*(Max-Min))+Min;}
function setClass(ElementName,ClassName){"use strict";document.getElementById(ElementName).className=ClassName;}
function removeAllChilds(Parent){while(Parent.firstChild){Parent.removeChild(Parent.firstChild);}}
function getElementUnderMouse(Event){return document.elementFromPoint(Event.clientX,Event.clientY);}
function getScript(ScriptUrl){return document.getElementById(ScriptUrl);}
function loadScript(ScriptUrl){let AlreadyLoadedScript=getScript(ScriptUrl);if(AlreadyLoadedScript!=null){AlreadyLoadedScript.remove();}
let LoadScript=document.createElement('script');LoadScript.src=ScriptUrl;LoadScript.id=ScriptUrl;document.body.appendChild(LoadScript);return LoadScript;}
function removeScript(ScriptUrl){let AlreadyLoadedScript=getScript(ScriptUrl);if(AlreadyLoadedScript!=null){AlreadyLoadedScript.remove();}}
function getImageDimensions(file){return new Promise(function(resolved,rejected){let i=new Image();i.onload=function(){resolved(i.height);};i.onerror=function(){resolved(0);};i.src=file;})}
function getPageURLPath(Part){if(window.location.protocol=='file:'||(window.location.origin.includes("https")==false)){return null;}
return window.location.pathname.split("/")[Part];}
function getCookieValue(CName){let name=CName+"=";let decodedCookie=decodeURIComponent(document.cookie);let ca=decodedCookie.split(';');for(let i=0;i<ca.length;i++){let c=ca[i];while(c.charAt(0)==' '){c=c.substring(1);}
if(c.indexOf(name)==0){return c.substring(name.length,c.length);}}
return null;}
function disableScrolling(){let x=window.scrollX;let y=window.scrollY;window.onscroll=function(){window.scrollTo(x,y);};}
function enableScrolling(){window.onscroll=function(){};}
function checkElementVisible(Element,ScrollFrame){return(ScrollFrame.scrollTop-Element.offsetHeight+10<Element.offsetTop&&Element.offsetTop<ScrollFrame.scrollTop+ScrollFrame.clientHeight-30);}
function deviceIsMobile(){let check=false;(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))
check=true;})(navigator.userAgent||navigator.vendor||window.opera);return check;};function timestampToString(Seconds){let Values={Year:31536000,Month:2678400,Week:604800,Day:86400,Hour:3600,Minute:60,Second:1,}
let Result={};let ValueKeys=Object.keys(Values);for(let i=0;i<ValueKeys.length;i++){let ValueTake=Values[ValueKeys[i]];while(Seconds-ValueTake>0){if(Result[ValueKeys[i]]==null){Result[ValueKeys[i]]=1;}else{Result[ValueKeys[i]]+=1;}
Seconds-=ValueTake;}}
let Formatted="";let ResultKeys=Object.keys(Result);for(let i=0;i<ResultKeys.length;i++){let Item=Result[ResultKeys[i]];if(Item>1){Formatted+=Item+" "+ResultKeys[i]+"s  ";}else{Formatted+=Item+" "+ResultKeys[i]+"  ";}}
return Formatted;}
function checkElementVisible(Element,ScrollFrame){return(ScrollFrame.scrollTop-Element.offsetHeight+10<Element.offsetTop&&Element.offsetTop<ScrollFrame.scrollTop+ScrollFrame.clientHeight-30);}
function OutlineHoverOver(Element){Element.style.backgroundColor=ThemeColors.GreyOutline;}
function OutlineHoverOut(Element){Element.style.backgroundColor="rgb(255, 255, 255, 0)";}
function isInViewport(Elem){let ObjectRect=Elem.getBoundingClientRect();return(ObjectRect.y)+(Elem.offsetHeight)>0&&ObjectRect.y<(window.innerHeight||document.documentElement.clientHeight);}
function SmoothScrollAnim(){let ScrollInElements=document.querySelectorAll('[scrollanim]');for(let i=0;i<ScrollInElements.length;i++){let CurrentElem=ScrollInElements[i];setCSS(CurrentElem,"opacity","0");if(isInViewport(CurrentElem)==true){CurrentElem.removeAttribute("scrollanim");let OriginalTransition=getCSS(CurrentElem,"transition");setCSS(CurrentElem,"transition","all 1s ease");CurrentElem.style.opacity="1";if(OriginalTransition!=null){async function RevertProp(){await sleep(1500);setCSS(CurrentElem,"transition",OriginalTransition);}
RevertProp();}}}}
window.addEventListener("scroll",SmoothScrollAnim);const sleep=(milliseconds)=>{return new Promise(resolve=>setTimeout(resolve,milliseconds))}