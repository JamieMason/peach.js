var peach=function(a){function b(a,b,c,d){return["for (_n = _x % ",d,"; _n > 0; _n--) {",b,"}","for (_n = (_x / ",d,") ^ 0; _n > 0; _n--) {",c,"}"].join("")}function c(a,b,c,d){return["_n = _x % ",d,";","while (_n--) {",b,"}","_n = (_x / ",d,") ^ 0;","while (_n--) {",c,"}"].join("")}function h(a){var b,c,d;return a.source=function(){return b||(b=Function.prototype.toString.apply(a))},a.params=function(){return b=a.source(),c||(c=b.split(/\(|\)/g)[1].replace(/\s*/g,"").split(","))},a.body=function(){if(d)return d;var b=a.source().split(/\{|\}/g);return b.shift(),b.length===3&&b.pop(),d=(b.join("")+"\n").replace(/^\s+|\s+$/g,"")},a}function i(){var a=this.fn.params();return a[0]=a[0]||"_e",a[1]=a[1]||"_i",a[2]=a[2]||"_c",a}function j(){var a=this.nameParams();return[this.setValue(a),this.fn.body(),a[1]+"++;"].join("\n")}function k(){return a(this.source())}function l(a,b){return{fn:h(a),xUnroll:b||8,nameParams:i,body:function(){},source:function(){},compile:k}}function m(a,b){var c=l(a,b);return c.body=function(){var a=this.nameParams();return[a[0]+"="+a[2]+"["+a[1]+"];",this.fn.body(),a[1]+"++;"].join("\n")},c.source=function(){var a=this.nameParams(),b=this.body(),c=a[0],e=a[1],f=a[2],g=[].concat(a),h=this.xUnroll;return g.splice(0,2),["function (",g.join(","),") {","var _x = ",f,".length",",",e," = 0",",","_n",",",c,";",d(a,b,(new Array(h+1)).join(b),h),"}"].join("")},c}function n(a,b){var c=l(a,b);return c.body=function(){var a=this.nameParams();return[a[0]+"="+a[2]+"[",a[1],"=_k[_i]];",this.fn.body(),"_i++;"].join("\n")},c.source=function(){var a=this.nameParams(),b=this.body(),c=a[0],e=a[1],f=a[2],g=[].concat(a),h=this.xUnroll;return g.splice(0,2),["function (",g.join(","),") {","var _k = Object.keys(",f,"),","_x = _k.length,","_i = 0,",e,",","_n",",",c,";",d(a,b,(new Array(h+1)).join(b),h),"}"].join("")},c}function o(a,b){return function(c,d){var e=Object.prototype.toString.call(c)==="[object Object]",f,g=e?b:a;return d?(f=Array.prototype.slice.call(arguments),f.splice(1,1),g.apply(d||{},f)):g(c)}}function p(a,b){var c=m(a,b),d=n(a,b);return o(c.compile(),d.compile())}var d=b,e={"Android 2":c,"Camino 2":c,"Chrome 12":b,"Chrome 13":c,"Chrome 14":b,"Chrome 15":c,"Fennec 6":c,"Firefox 3":b,"Firefox 3.0.18":c,"Firefox 5.0":b,"Firefox 5.0.1":c,"Firefox 6":c,"Firefox 7":b,"Firefox 8":b,"IE 5.5":b,"IE 7":c,"IE 8":c,"IE 9":b,"iPad 4":b,"iPhone 4":c,"Opera 10":c,"Opera 11":c,"Opera Mobile 11":c,"Safari 3.2.2":c,"Safari 4":b,"Safari 5.0.3":c,"Safari 5.0.5":b,"Safari 5.1":b},f,g;return p.tune=function(a){if(e[a]){d=e[a];return}var c=a.split(/ (?=[0-9])/),f=c[0],g=c[1],h=g.split(".")[0],i=f+" "+h;d=e[i]||e[f]||b},p}(function(s){return function(a){var b;return b=a("(f="+s+")")}(eval)});