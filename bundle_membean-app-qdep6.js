/*!
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
;
Ext.Resizable = Ext.extend( Ext.util.Observable, {
    constructor: function ( d, e ) {
        this.el = Ext.get( d );
        if ( e && e.wrap ) {
            e.resizeChild = this.el;
            this.el = this.el.wrap( typeof e.wrap == "object" ? e.wrap : { cls: "xresizable-wrap" } );
            this.el.id = this.el.dom.id = e.resizeChild.id + "-rzwrap";
            this.el.setStyle( "overflow", "hidden" );
            this.el.setPositioning( e.resizeChild.getPositioning() );
            e.resizeChild.clearPositioning();
            if ( !e.width || !e.height ) {
                var f = e.resizeChild.getSize();
                this.el.setSize( f.width, f.height )
            }
            if ( e.pinned && !e.adjustments ) { e.adjustments = "auto" }
        }
        this.proxy = this.el.createProxy( { tag: "div", cls: "x-resizable-proxy", id: this.el.id + "-rzproxy" }, Ext.getBody() );
        this.proxy.unselectable();
        this.proxy.enableDisplayMode( "block" );
        Ext.apply( this, e );
        if ( this.pinned ) {
            this.disableTrackOver = true;
            this.el.addClass( "x-resizable-pinned" )
        }
        var j = this.el.getStyle( "position" );
        if ( j != "absolute" && j != "fixed" ) { this.el.setStyle( "position", "relative" ) }
        if ( !this.handles ) { this.handles = "s,e,se"; if ( this.multiDirectional ) { this.handles += ",n,w" } }
        if ( this.handles == "all" ) { this.handles = "n s e w ne nw se sw" }
        var n = this.handles.split( /\s*?[,;]\s*?| / );
        var c = Ext.Resizable.positions;
        for ( var h = 0, k = n.length; h < k; h++ ) {
            if ( n[ h ] && c[ n[ h ] ] ) {
                var m = c[ n[ h ] ];
                this[ m ] = new Ext.Resizable.Handle( this, m, this.disableTrackOver, this.transparent, this.handleCls )
            }
        }
        this.corner = this.southeast;
        if ( this.handles.indexOf( "n" ) != -1 || this.handles.indexOf( "w" ) != -1 ) { this.updateBox = true } this.activeHandle = null;
        if ( this.resizeChild ) { if ( typeof this.resizeChild == "boolean" ) { this.resizeChild = Ext.get( this.el.dom.firstChild, true ) } else { this.resizeChild = Ext.get( this.resizeChild, true ) } }
        if ( this.adjustments == "auto" ) {
            var b = this.resizeChild;
            var l = this.west,
                g = this.east,
                a = this.north,
                n = this.south;
            if ( b && ( l || a ) ) {
                b.position( "relative" );
                b.setLeft( l ? l.el.getWidth() : 0 );
                b.setTop( a ? a.el.getHeight() : 0 )
            }
            this.adjustments = [ ( g ? -g.el.getWidth() : 0 ) + ( l ? -l.el.getWidth() : 0 ), ( a ? -a.el.getHeight() : 0 ) + ( n ? -n.el.getHeight() : 0 ) - 1 ]
        }
        if ( this.draggable ) {
            this.dd = this.dynamic ? this.el.initDD( null ) : this.el.initDDProxy( null, { dragElId: this.proxy.id } );
            this.dd.setHandleElId( this.resizeChild ? this.resizeChild.id : this.el.id );
            if ( this.constrainTo ) { this.dd.constrainTo( this.constrainTo ) }
        }
        this.addEvents( "beforeresize", "resize" );
        if ( this.width !== null && this.height !== null ) { this.resizeTo( this.width, this.height ) } else { this.updateChildSize() }
        if ( Ext.isIE ) { this.el.dom.style.zoom = 1 } Ext.Resizable.superclass.constructor.call( this )
    },
    adjustments: [ 0, 0 ],
    animate: false,
    disableTrackOver: false,
    draggable: false,
    duration: 0.35,
    dynamic: false,
    easing: "easeOutStrong",
    enabled: true,
    handles: false,
    multiDirectional: false,
    height: null,
    width: null,
    heightIncrement: 0,
    widthIncrement: 0,
    minHeight: 5,
    minWidth: 5,
    maxHeight: 10000,
    maxWidth: 10000,
    minX: 0,
    minY: 0,
    pinned: false,
    preserveRatio: false,
    resizeChild: false,
    transparent: false,
    resizeTo: function ( b, a ) {
        this.el.setSize( b, a );
        this.updateChildSize();
        this.fireEvent( "resize", this, b, a, null )
    },
    startSizing: function ( c, b ) {
        this.fireEvent( "beforeresize", this, c );
        if ( this.enabled ) {
            if ( !this.overlay ) {
                this.overlay = this.el.createProxy( { tag: "div", cls: "x-resizable-overlay", html: "&#160;" }, Ext.getBody() );
                this.overlay.unselectable();
                this.overlay.enableDisplayMode( "block" );
                this.overlay.on( { scope: this, mousemove: this.onMouseMove, mouseup: this.onMouseUp } )
            }
            this.overlay.setStyle( "cursor", b.el.getStyle( "cursor" ) );
            this.resizing = true;
            this.startBox = this.el.getBox();
            this.startPoint = c.getXY();
            this.offsets = [ ( this.startBox.x + this.startBox.width ) - this.startPoint[ 0 ], ( this.startBox.y + this.startBox.height ) - this.startPoint[ 1 ] ];
            this.overlay.setSize( Ext.lib.Dom.getViewWidth( true ), Ext.lib.Dom.getViewHeight( true ) );
            this.overlay.show();
            if ( this.constrainTo ) {
                var a = Ext.get( this.constrainTo );
                this.resizeRegion = a.getRegion().adjust( a.getFrameWidth( "t" ), a.getFrameWidth( "l" ), -a.getFrameWidth( "b" ), -a.getFrameWidth( "r" ) )
            }
            this.proxy.setStyle( "visibility", "hidden" );
            this.proxy.show();
            this.proxy.setBox( this.startBox );
            if ( !this.dynamic ) { this.proxy.setStyle( "visibility", "visible" ) }
        }
    },
    onMouseDown: function ( a, b ) {
        if ( this.enabled ) {
            b.stopEvent();
            this.activeHandle = a;
            this.startSizing( b, a )
        }
    },
    onMouseUp: function ( b ) {
        this.activeHandle = null;
        var a = this.resizeElement();
        this.resizing = false;
        this.handleOut();
        this.overlay.hide();
        this.proxy.hide();
        this.fireEvent( "resize", this, a.width, a.height, b )
    },
    updateChildSize: function () {
        if ( this.resizeChild ) {
            var d = this.el;
            var e = this.resizeChild;
            var c = this.adjustments;
            if ( d.dom.offsetWidth ) {
                var a = d.getSize( true );
                e.setSize( a.width + c[ 0 ], a.height + c[ 1 ] )
            }
            if ( Ext.isIE ) {
                setTimeout( function () {
                    if ( d.dom.offsetWidth ) {
                        var f = d.getSize( true );
                        e.setSize( f.width + c[ 0 ], f.height + c[ 1 ] )
                    }
                }, 10 )
            }
        }
    },
    snap: function ( c, e, b ) { if ( !e || !c ) { return c } var d = c; var a = c % e; if ( a > 0 ) { if ( a > ( e / 2 ) ) { d = c + ( e - a ) } else { d = c - a } } return Math.max( b, d ) },
    resizeElement: function () {
        var a = this.proxy.getBox();
        if ( this.updateBox ) { this.el.setBox( a, false, this.animate, this.duration, null, this.easing ) } else { this.el.setSize( a.width, a.height, this.animate, this.duration, null, this.easing ) } this.updateChildSize();
        if ( !this.dynamic ) { this.proxy.hide() }
        if ( this.draggable && this.constrainTo ) {
            this.dd.resetConstraints();
            this.dd.constrainTo( this.constrainTo )
        }
        return a
    },
    constrain: function ( b, c, a, d ) { if ( b - c < a ) { c = b - a } else { if ( b - c > d ) { c = b - d } } return c },
    onMouseMove: function ( D ) {
        if ( this.enabled && this.activeHandle ) {
            try {
                if ( this.resizeRegion && !this.resizeRegion.contains( D.getPoint() ) ) { return }
                var A = this.curSize || this.startBox,
                    l = this.startBox.x,
                    k = this.startBox.y,
                    c = l,
                    b = k,
                    m = A.width,
                    B = A.height,
                    d = m,
                    o = B,
                    n = this.minWidth,
                    E = this.minHeight,
                    z = this.maxWidth,
                    H = this.maxHeight,
                    g = this.widthIncrement,
                    a = this.heightIncrement,
                    F = D.getXY(),
                    v = -( this.startPoint[ 0 ] - Math.max( this.minX, F[ 0 ] ) ),
                    r = -( this.startPoint[ 1 ] - Math.max( this.minY, F[ 1 ] ) ),
                    j = this.activeHandle.position,
                    I, f;
                switch ( j ) {
                    case "east":
                        m += v;
                        m = Math.min( Math.max( n, m ), z );
                        break;
                    case "south":
                        B += r;
                        B = Math.min( Math.max( E, B ), H );
                        break;
                    case "southeast":
                        m += v;
                        B += r;
                        m = Math.min( Math.max( n, m ), z );
                        B = Math.min( Math.max( E, B ), H );
                        break;
                    case "north":
                        r = this.constrain( B, r, E, H );
                        k += r;
                        B -= r;
                        break;
                    case "west":
                        v = this.constrain( m, v, n, z );
                        l += v;
                        m -= v;
                        break;
                    case "northeast":
                        m += v;
                        m = Math.min( Math.max( n, m ), z );
                        r = this.constrain( B, r, E, H );
                        k += r;
                        B -= r;
                        break;
                    case "northwest":
                        v = this.constrain( m, v, n, z );
                        r = this.constrain( B, r, E, H );
                        k += r;
                        B -= r;
                        l += v;
                        m -= v;
                        break;
                    case "southwest":
                        v = this.constrain( m, v, n, z );
                        B += r;
                        B = Math.min( Math.max( E, B ), H );
                        l += v;
                        m -= v;
                        break
                }
                var u = this.snap( m, g, n );
                var G = this.snap( B, a, E );
                if ( u != m || G != B ) {
                    switch ( j ) {
                        case "northeast":
                            k -= G - B;
                            break;
                        case "north":
                            k -= G - B;
                            break;
                        case "southwest":
                            l -= u - m;
                            break;
                        case "west":
                            l -= u - m;
                            break;
                        case "northwest":
                            l -= u - m;
                            k -= G - B;
                            break
                    }
                    m = u;
                    B = G
                }
                if ( this.preserveRatio ) {
                    switch ( j ) {
                        case "southeast":
                        case "east":
                            B = o * ( m / d );
                            B = Math.min( Math.max( E, B ), H );
                            m = d * ( B / o );
                            break;
                        case "south":
                            m = d * ( B / o );
                            m = Math.min( Math.max( n, m ), z );
                            B = o * ( m / d );
                            break;
                        case "northeast":
                            m = d * ( B / o );
                            m = Math.min( Math.max( n, m ), z );
                            B = o * ( m / d );
                            break;
                        case "north":
                            I = m;
                            m = d * ( B / o );
                            m = Math.min( Math.max( n, m ), z );
                            B = o * ( m / d );
                            l += ( I - m ) / 2;
                            break;
                        case "southwest":
                            B = o * ( m / d );
                            B = Math.min( Math.max( E, B ), H );
                            I = m;
                            m = d * ( B / o );
                            l += I - m;
                            break;
                        case "west":
                            f = B;
                            B = o * ( m / d );
                            B = Math.min( Math.max( E, B ), H );
                            k += ( f - B ) / 2;
                            I = m;
                            m = d * ( B / o );
                            l += I - m;
                            break;
                        case "northwest":
                            I = m;
                            f = B;
                            B = o * ( m / d );
                            B = Math.min( Math.max( E, B ), H );
                            m = d * ( B / o );
                            k += f - B;
                            l += I - m;
                            break
                    }
                }
                this.proxy.setBounds( l, k, m, B );
                if ( this.dynamic ) { this.resizeElement() }
            } catch ( C ) { }
        }
    },
    handleOver: function () { if ( this.enabled ) { this.el.addClass( "x-resizable-over" ) } },
    handleOut: function () { if ( !this.resizing ) { this.el.removeClass( "x-resizable-over" ) } },
    getEl: function () { return this.el },
    getResizeChild: function () { return this.resizeChild },
    destroy: function ( b ) {
        Ext.destroy( this.dd, this.overlay, this.proxy );
        this.overlay = null;
        this.proxy = null;
        var c = Ext.Resizable.positions;
        for ( var a in c ) { if ( typeof c[ a ] != "function" && this[ c[ a ] ] ) { this[ c[ a ] ].destroy() } }
        if ( b ) {
            this.el.update( "" );
            Ext.destroy( this.el );
            this.el = null
        }
        this.purgeListeners()
    },
    syncHandleHeight: function () { var a = this.el.getHeight( true ); if ( this.west ) { this.west.el.setHeight( a ) } if ( this.east ) { this.east.el.setHeight( a ) } }
} );
Ext.Resizable.positions = { n: "north", s: "south", e: "east", w: "west", se: "southeast", sw: "southwest", nw: "northwest", ne: "northeast" };
Ext.Resizable.Handle = Ext.extend( Object, {
    constructor: function ( d, f, c, e, a ) {
        if ( !this.tpl ) {
            var b = Ext.DomHelper.createTemplate( { tag: "div", cls: "x-resizable-handle x-resizable-handle-{0}" } );
            b.compile();
            Ext.Resizable.Handle.prototype.tpl = b
        }
        this.position = f;
        this.rz = d;
        this.el = this.tpl.append( d.el.dom, [ this.position ], true );
        this.el.unselectable();
        if ( e ) { this.el.setOpacity( 0 ) }
        if ( !Ext.isEmpty( a ) ) { this.el.addClass( a ) } this.el.on( "mousedown", this.onMouseDown, this );
        if ( !c ) { this.el.on( { scope: this, mouseover: this.onMouseOver, mouseout: this.onMouseOut } ) }
    },
    afterResize: function ( a ) { },
    onMouseDown: function ( a ) { this.rz.onMouseDown( this, a ) },
    onMouseOver: function ( a ) { this.rz.handleOver( this, a ) },
    onMouseOut: function ( a ) { this.rz.handleOut( this, a ) },
    destroy: function () {
        Ext.destroy( this.el );
        this.el = null
    }
} );
Shadowbox.init( { skipSetup: true, players: [ "swf", "flv", "iframe", "html", "inline" ], useSizzle: false, enableKeys: false } );
if ( ( typeof Range !== "undefined" ) && !Range.prototype.createContextualFragment ) {
    Range.prototype.createContextualFragment = function ( a ) {
        var c = document.createDocumentFragment(),
            b = document.createElement( "div" );
        c.appendChild( b );
        b.outerHTML = a;
        return c
    }
}
if ( !Array.prototype.filter ) { Array.prototype.filter = function filter ( d ) { var a = []; var c = arguments[ 1 ]; for ( var b = 0; b < this.length; b++ ) { if ( d.call( c, this[ b ] ) ) { a.push( this[ b ] ) } } return a } }
if ( !Array.prototype.forEach ) { Array.prototype.forEach = function forEach ( d, b ) { var a = +this.length; for ( var c = 0; c < a; c++ ) { if ( c in this ) { d.call( b, this[ c ], c, this ) } } } } Ext.override( Ext.Element, {
    getText: function () { return ( this.dom[ Ext.isIE ? "innerText" : "textContent" ] ).trim() },
    attributes: function ( d ) {
        d = d || /^id|class/;
        p = {};
        var b = this.dom.attributes;
        for ( var c = 0; c < b.length; ++c ) { var a = b[ c ]; if ( d.test( a.name ) ) { continue } p[ a.name ] = a.value }
        return p
    }
} );


MB = function () {
    Ext.Ajax.defaultHeaders = { Accept: "application/json, text/html, text/javascript" };
    return {
        helpBox: function ( b, a ) { if ( a ) { Ext.Msg.show( { msg: a, icon: Ext.MessageBox.INFO, modal: true, animEl: b, width: 350 } ) } },
        AjaxGenericFailureMsg: function () {
            var a = "There seems to be some trouble reaching our server. Please check your network connection or wait for a minute and try again. If you are unable to resolve this issue please  <b> <a href='/contact'>contact us</b></a> and we will be happy to assist you!";
            Ext.Msg.show( { msg: a, modal: false, buttons: Ext.MessageBox.OK, icon: Ext.MessageBox.ERROR, cls: "help-text", width: 450 } )
        },
        AjaxGenericRetryMessage: function ( a ) {
            var b = "There's a problem connecting to Membean. Please wait while we retry.";
            Ext.Msg.show( { msg: b, modal: true, icon: Ext.MessageBox.INFO, cls: "help-text", width: 450 } );
            ( function () { Ext.defer( function () { Ext.MessageBox.hide() }, 6000 ) } )()
        },
        AjaxInternalErrorMessage: function () {
            var a = "We're sorry, but we've encountered an error that we couldn't automatically resolve. Please <b> <a href='/contact'>contact us</b></a> and we will be happy to assist you!";
            Ext.Msg.show( { msg: a, modal: true, buttons: Ext.MessageBox.OK, icon: Ext.MessageBox.ERROR, cls: "help-text", width: 450 } )
        },
        AjaxNetworkErrorMessage: function () {
            var a = "Unable to reach Membean. Please check your internet connection or retry later.";
            Ext.Msg.show( { msg: a, modal: true, buttons: Ext.MessageBox.OK, icon: Ext.MessageBox.ERROR, cls: "help-text", width: 450 } )
        },
        spinnerOn: function ( a ) {
            var b = Ext.get( "spinner" );
            MB.spinner = a.insertFirst( b )
        },
        focusOnFirstFormControl: function () { if ( document.forms.length > 0 ) { var d = [ "text", "textarea" ]; var e = document.forms[ 0 ]; var c = Ext.fly( e ); if ( c.isVisible( true ) && !c.getAttribute( "noautofocus" ) ) { for ( var b = 0; b < e.elements.length; b++ ) { var f = e.elements[ b ]; for ( var a = 0; a < d.length; a++ ) { if ( f.getAttribute( "type" ) == d[ a ] ) { if ( !f.getAttribute( "noautofocus" ) ) { f.focus() } return false } } } } } },
        keyCode: function ( b ) { var a = b.keyCode ? b.keyCode : b.charCode; return a },
        flash: function ( a, b ) {
            Ext.select( a ).each( function ( c ) {
                c.fadeIn( { duration: b } );
                c.fadeOut( { duration: b } );
                c.fadeIn( { duration: b, callback: function ( d ) { d.setStyle( "visibility", "" ) } } )
            } )
        },
        assetify: function ( a ) { return Ext.get( "asset_host" ).dom.innerHTML + a },
        isIpad: function () { return navigator.userAgent.match( /iPad/i ) != null },
        embedJwAudioPlayer: function ( d ) {
            var c = {};
            var h = "https://cdn0.membean.com/audio";
            Ext.apply( c, d, { width: 330, height: 24, nonstreaming_server: h, autostart: false } );
            var b = c.container;
            var f = c.audio_name;
            var e = c.width;
            var a = c.height;
            var g = { file: c.nonstreaming_server + f + ".mp3", width: e, height: a, id: "audio-player", controlbar: "bottom", modes: [ { type: "html5" }, { type: "flash", src: "/flash/player5.10.licensed.swf" }, { type: "download" } ] };
            jwplayer( b ).setup( g )
        },
        embedJwPlayer: function ( b ) {
            var c = "video/" + b.video_name + ".mp4";
            var a = { width: b.width || 350, height: b.height || 260, image: b.video_image, logo: "https://membean.com/images/membean-logo-tiny.png", frontcolor: "cccccc", provider: "rtmp", streamer: "rtmp://streaming.membean.com/cfx/st", backcolor: "111111", file: c, start: b.start || 0, autostart: b.autostart, duration: b.duration, modes: [ { type: "html5", config: { file: "https://cdn0.membean.com/" + c, provider: "video" } }, { type: "download" } ] };
            jwplayer( b.container ).setup( a )
        },
        activateShadowBoxVideos: function () {
            var b = viewportSize.getWidth();
            var d = viewportSize.getHeight() - 100;
            var c = Math.min( 640, b );
            var a = Math.min( 494, d );
            var e = "https://cdn0.membean.com/video";
            Ext.getBody().on( "click", function ( k, h ) {
                k.preventDefault();
                h = Ext.get( h );
                var f = h.getAttribute( "video-id" );
                var g = e + "/" + f + ".jpg";
                var j = h.getAttribute( "data-video-related" );
                if ( Shadowbox && f ) {
                    Shadowbox.open( {
                        player: "html",
                        content: "<div id='shadowbox-video-placeholder'/>",
                        title: h.title,
                        width: c,
                        height: a + 4,
                        options: {
                            onFinish: function ( l ) { MB.embedJwPlayer( { container: "shadowbox-video-placeholder", video_name: f, width: c, height: a, video_image: g, relatedvids: j, autostart: true } ) },
                            beforeClose: function ( r ) {
                                var m = "shadowbox-video-placeholder";
                                var l = Ext.get( m );
                                if ( l ) {
                                    l.addClass( "hidden" );
                                    Ext.getBody().appendChild( l );
                                    var n = jwplayer( m );
                                    if ( n ) { try { n.remove() } catch ( o ) { } }
                                }
                                return true
                            }
                        }
                    } )
                }
            }, this, { delegate: ".video-link" } )
        },
        activateEmbeddedVideos: function () { var a = Ext.select( ".embed-video" ).each( function ( d ) { var k = d.getAttribute( "video_url" ); var g = d.getAttribute( "video_img_url" ); var j = d.getAttribute( "replace_el" ); var c = parseInt( d.getAttribute( "video_width" ), 10 ) || 350; var l = ( parseInt( d.getAttribute( "video_height" ), 10 ) || 263 ) + 25; var f = d.getAttribute( "duration" ); var b = d.getAttribute( "start" ); var e = d.getAttribute( "playlist" ); var h = { container: j, video_name: k, width: c, height: l, autostart: false, playlist: e, video_image: g }; if ( f ) { h.duration = f } if ( b ) { h.start = b } if ( k && j ) { MB.embedJwPlayer( h ) } } ) },
        activateEmbeddedAudios: function () { var a = Ext.select( ".embed-audio" ).each( function ( d ) { var c = d.getAttribute( "data-audio-url" ); var e = d.getAttribute( "data-replace-el" ); var b = { container: e, audio_name: c }; if ( c && e ) { MB.embedJwAudioPlayer( b ) } } ) },
        activateShowHideBox: function () {
            Ext.select( ".show-hide-box" ).each( function ( b ) {
                var c = b.select( ".expand-icon" ).first();
                var a = b.select( ".box-content" ).first();
                b.select( ".click-el" ).on( "click", function ( d ) {
                    a.enableDisplayMode();
                    a.toggle();
                    if ( c ) {
                        var f = c.getText();
                        ( f == "▶" ) ? c.update( "▼" ) : c.update( "▶" )
                    }
                } )
            } )
        },
        activateModalCalloutBox: function () {
            var a = Ext.get( "page-mask" );
            if ( a ) {
                var c = Ext.get( "callout-box" );
                if ( c ) {
                    var b = Ext.select( "#callout-box .content .action-btn" );
                    if ( b ) {
                        b.on( "click", function ( f, d ) {
                            f.stopEvent();
                            if ( d.href && ( d.href.charAt( d.href.length - 1 ) != "#" ) ) { window.location.href = d.href } a.enableDisplayMode().fadeOut();
                            c.enableDisplayMode().fadeOut()
                        } )
                    }
                }
            }
        },
        activateModalCalloutBox1: function () {
            Ext.getBody().on( "click", function ( f, c ) {
                var d = Ext.get( c );
                var b = d.parent( ".callout-box" );
                var a = b.prev( ".page-mask" );
                if ( b ) {
                    f.stopEvent();
                    if ( d.dom.href && ( d.dom.href.charAt( d.dom.href.length - 1 ) != "#" ) ) { window.location.href = d.dom.href } a.enableDisplayMode().fadeOut();
                    b.enableDisplayMode().fadeOut()
                }
            }, this, { delegate: ".action-btn" } )
        },
        activateMessages: function () {
            Ext.select( ".message .close" ).on( "click", function ( b, c ) {
                b.preventDefault();
                var a = b.getTarget( ".message", 2, true );
                a.enableDisplayMode().fadeOut( { duration: 1 } )
            } )
        },
        swfEmbedCallback: function ( b ) { if ( !b.success ) { var a = Ext.get( b.id ); if ( a ) { a.insertHtml( "afterBegin", "<h2 class='error'>Flash player needed </h2>" ) } } },
        isBot: function () { var a = navigator.userAgent.toLowerCase(); return /Googlebot/.test( a ) },
        growl: function ( b, c ) {
            var c = c || "section1";
            if ( el = Ext.get( c ) ) {
                var a = el.insertHtml( "afterBegin", "<div id='user-growl'>" + b + "</div>", true );
                a.slideIn( "t", { useDisplay: true } ).pause( 1.5 ).slideOut( "t", { useDisplay: true } )
            }
        },
        displayCalloutMsg: function ( b, d, c, a ) { if ( b ) { b.mask(); if ( a ) { c = "<img src='/images/" + a + "'/>" + c } b.insertHtml( "afterBegin", "<div id='callout-box'><div class='content'><h3>" + d + "</h3><p>" + c + "</p><div></div>" ) } },
        sendRemoteMessage: function ( a ) { Ext.Ajax.request( { url: "/debugger/log", params: { text: a } } ) },
        closePanel: function () { Ext.getBody().on( "click", function ( c, b ) { c.stopEvent(); var b = Ext.get( b ); var a = b.parent( ".panel" ); if ( a ) { a.switchOff( { useDisplay: true, duration: 1 } ) } }, this, { delegate: ".close-button" } ) },
        enableButton: function ( a, b ) {
            a.disabled = false;
            a.value = b
        },
        setAffliateCookie: function () {
            var a = "afc";
            var b = Ext.util.Cookies.get( a );
            if ( !b ) {
                var c = Ext.urlDecode( location.search.substring( 1 ) );
                aff = c[ a ];
                if ( aff ) { Ext.util.Cookies.set( "affliate", aff, new Date().add( Date.DAY, 30 ) ) }
            }
        },
        userEvent: function ( a ) { if ( !( "isTrusted" in a ) ) { return true } return a.isTrusted },
        getSelectedText: function () { var a = ""; if ( window.getSelection ) { a = window.getSelection() } else { if ( document.getSelection ) { a = document.getSelection() } else { if ( document.selection ) { a = document.selection.createRange().text } } } return a },
        cacheBuster1: function () { },
        activateCalendarRange: function () {
            var e = Ext.get( "start_date" );
            var d = Ext.get( "end_date" );
            if ( e && d ) {
                var c = e.parent( "form" );
                if ( e && d ) {
                    var b = new MB.Calendar( { clickElement: e, minDate: ( new Date() ).add( Date.YEAR, -1 ), tiedToTextField: "start_date" } );
                    var a = new MB.Calendar( { clickElement: d, minDate: ( new Date() ).add( Date.YEAR, -1 ), tiedToTextField: "end_date" } );
                    c.on( "submit", function ( f ) {
                        if ( e.dom.value.match( /Start/ ) ) {
                            f.stopEvent();
                            e.addClass( "fieldWithErrors" )
                        } else { e.removeClass( "fieldWithErrors" ) }
                        if ( d.dom.value.match( /End/ ) ) {
                            f.stopEvent();
                            d.addClass( "fieldWithErrors" )
                        } else { d.removeClass( "fieldWithErrors" ) }
                    } );
                    b.on( "select", function () { e.removeClass( "fieldWithErrors" ) } );
                    a.on( "select", function () { d.removeClass( "fieldWithErrors" ) } )
                }
            }
        }
    }
}();
Ext.onReady( function () {
    Ext.BLANK_IMAGE_URL = "/images/ext-blank.gif";
    MB.activateShowHideBox();
    MB.activateMessages();
    MB.activateModalCalloutBox();
    MB.activateModalCalloutBox1();
    MB.focusOnFirstFormControl();
    Ext.Ajax.timeout = 30000;
    Ext.Ajax.on( {
        beforerequest: function () { if ( MB.spinner ) { MB.spinner.show() } },
        requestcomplete: function () { if ( MB.spinner ) { MB.spinner.hide( { remove: true } ) } },
        requestexception: function ( c, a, b ) {
            if ( a.status == 500 ) { MB.AjaxInternalErrorMessage(); if ( MB.spinner ) { MB.spinner.hide( { remove: true } ) } if ( b.retries ) { b.retries == 0 } return }
            if ( a.isTimeout ) {
                if ( b.retries ) {
                    b.retries--;
                    MB.AjaxGenericRetryMessage();
                    Ext.Ajax.request( b );
                    return
                } else { if ( b.standardMessageOnFailure ) { MB.AjaxGenericFailureMsg() } }
            }
            if ( a.status == 0 ) { if ( a.statusText == "communication failure" ) { if ( !b.heartbeat ) { MB.AjaxNetworkErrorMessage() } } }
            if ( MB.spinner ) { MB.spinner.hide( { remove: true } ) }
        }
    } );
    MB.activateShadowBoxVideos();
    MB.activateCalendarRange()
} );
Array.prototype.diff = function () {
    var e = this;
    var d = a2 = null;
    var k = 0;
    while ( k < arguments.length ) {
        d = [];
        a2 = arguments[ k ];
        var c = e.length;
        var b = a2.length;
        var h = true;
        for ( var g = 0; g < c; g++ ) { for ( var f = 0; f < b; f++ ) { if ( e[ g ] === a2[ f ] ) { h = false; break } } h ? d.push( e[ g ] ) : h = true } e = d;
        k++
    }
    return d.unique()
};
Array.prototype.unique = function () { var c = []; var b = this.length; for ( var e = 0; e < b; e++ ) { for ( var d = e + 1; d < b; d++ ) { if ( this[ e ] === this[ d ] ) { d = ++e } } c.push( this[ e ] ) } return c };
var B4 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function ( j ) {
        var m = "";
        var d, b, g, v, c, l, k;
        var h = 0;
        j = B4._utf8_encode( j );
        while ( h < j.length ) {
            d = j.charCodeAt( h++ );
            b = j.charCodeAt( h++ );
            g = j.charCodeAt( h++ );
            v = d >> 2;
            c = ( d & 3 ) << 4 | b >> 4;
            l = ( b & 15 ) << 2 | g >> 6;
            k = g & 63;
            if ( isNaN( b ) ) { l = k = 64 } else { if ( isNaN( g ) ) { k = 64 } } m = m + this._keyStr.charAt( v ) + this._keyStr.charAt( c ) + this._keyStr.charAt( l ) + this._keyStr.charAt( k )
        }
        return m
    },
    decode: function ( j ) {
        var m = "";
        var d, b, g;
        var v, c, l, k;
        var h = 0;
        j = j.replace( /[^A-Za-z0-9\+\/\=]/g, "" );
        while ( h < j.length ) {
            v = this._keyStr.indexOf( j.charAt( h++ ) );
            c = this._keyStr.indexOf( j.charAt( h++ ) );
            l = this._keyStr.indexOf( j.charAt( h++ ) );
            k = this._keyStr.indexOf( j.charAt( h++ ) );
            d = v << 2 | c >> 4;
            b = ( c & 15 ) << 4 | l >> 2;
            g = ( l & 3 ) << 6 | k;
            m = m + String.fromCharCode( d );
            if ( l != 64 ) { m = m + String.fromCharCode( b ) }
            if ( k != 64 ) { m = m + String.fromCharCode( g ) }
        }
        m = B4._utf8_decode( m );
        return m
    },
    _utf8_encode: function ( c ) {
        c = c.replace( /\r\n/g, "\n" );
        var a = "";
        for ( var d = 0; d < c.length; d++ ) {
            var b = c.charCodeAt( d );
            if ( b < 128 ) { a += String.fromCharCode( b ) } else {
                if ( b > 127 && b < 2048 ) {
                    a += String.fromCharCode( b >> 6 | 192 );
                    a += String.fromCharCode( b & 63 | 128 )
                } else {
                    a += String.fromCharCode( b >> 12 | 224 );
                    a += String.fromCharCode( b >> 6 & 63 | 128 );
                    a += String.fromCharCode( b & 63 | 128 )
                }
            }
        }
        return a
    },
    _utf8_decode: function ( c ) {
        var a = "";
        var d = 0;
        var b = c1 = c2 = 0;
        while ( d < c.length ) {
            b = c.charCodeAt( d );
            if ( b < 128 ) {
                a += String.fromCharCode( b );
                d++
            } else {
                if ( b > 191 && b < 224 ) {
                    c2 = c.charCodeAt( d + 1 );
                    a += String.fromCharCode( ( b & 31 ) << 6 | c2 & 63 );
                    d += 2
                } else {
                    c2 = c.charCodeAt( d + 1 );
                    c3 = c.charCodeAt( d + 2 );
                    a += String.fromCharCode( ( b & 15 ) << 12 | ( c2 & 63 ) << 6 | c3 & 63 );
                    d += 3
                }
            }
        }
        return a
    }
};
( function ( a ) {
    a.idleTimer = function ( g, f, e ) {
        e = a.extend( { startImmediately: true, idle: false, enabled: true, timeout: 30000, events: "mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove" }, e );
        f = f || document;
        var d = a( f ),
            h = d.data( "idleTimerObj" ) || {},
            b = function ( m ) {
                if ( typeof m === "number" ) { m = undefined }
                var l = a.data( m || f, "idleTimerObj" );
                l.idle = !l.idle;
                var j = ( +new Date() ) - l.olddate;
                l.olddate = +new Date();
                if ( l.idle && ( j < e.timeout ) ) {
                    l.idle = false;
                    clearTimeout( a.idleTimer.tId );
                    if ( e.enabled ) { a.idleTimer.tId = setTimeout( b, e.timeout ) }
                    return
                }
                var k = a.Event( a.data( f, "idleTimer", l.idle ? "idle" : "active" ) + ".idleTimer" );
                a( f ).trigger( k )
            },
            c = function ( j ) {
                var k = j.data( "idleTimerObj" ) || {};
                k.enabled = false;
                clearTimeout( k.tId );
                j.off( ".idleTimer" )
            };
        h.olddate = h.olddate || +new Date();
        if ( typeof g === "number" ) { e.timeout = g } else { if ( g === "destroy" ) { c( d ); return this } else { if ( g === "getElapsedTime" ) { return ( +new Date() ) - h.olddate } } } d.on( a.trim( ( e.events + " " ).split( " " ).join( ".idleTimer " ) ), function () {
            var j = a.data( this, "idleTimerObj" );
            clearTimeout( j.tId );
            if ( j.enabled ) { if ( j.idle ) { b( this ) } j.tId = setTimeout( b, j.timeout ) }
        } );
        h.idle = e.idle;
        h.enabled = e.enabled;
        h.timeout = e.timeout;
        if ( e.startImmediately ) { h.tId = setTimeout( b, h.timeout ) } d.data( "idleTimer", "active" );
        d.data( "idleTimerObj", h )
    };
    a.fn.idleTimer = function ( c, b ) { if ( !b ) { b = {} } if ( this[ 0 ] ) { return a.idleTimer( c, this[ 0 ], b ) } return this }
} )( jQuery );
MB.Tester = function ( a, e, c, d, b ) {
    this.max_tested_levels = Object.keys( d ).length;
    this.realwords = d;
    this.psuedowords = b;
    this.level_testers = {};
    this.el = c;
    this.addEvents( { endoftest: true } );
    this.container_el = a;
    this.test_el = e;
    this.interstitial = Ext.get( "progress-messages" );
    this.init_level_testers();
    this.current_tester = this.next_tester();
    this.yes_btn = Ext.get( "yes-btn" );
    this.no_btn = Ext.get( "no-btn" );
    this.update_first_word( this.current_tester.next() );
    this.build_progress_bar( "progress-bar" );
    this.progress();
    this.on( "endoftest", this.submit_test );
    this.keepalive_network()
};
Ext.extend( MB.Tester, Ext.util.Observable, {
    init_level_testers: function () {
        for ( var b = 1; b <= this.max_tested_levels; ++b ) {
            var a = new MB.LevelTester( this.realwords[ b ], this.psuedowords[ b ], b + 1 );
            this.level_testers[ b ] = a
        }
        this.current_level = 0
    },
    next_tester: function () { var a = this.current_level <= this.max_tested_levels ? this.level_testers[ ++this.current_level ] : null; return a },
    keepalive_network: function () {
        this.keepalive_runner = new Ext.util.TaskRunner();
        this.keepalive_runner.start( { run: function () { Ext.Ajax.request( { url: "/favicon.ico?t=" + new Date().getTime(), timeout: 7000, heartbeat: true } ) }, interval: 30000 } )
    },
    handle_button_click: function ( d, a ) {
        d.stopEvent();
        this.yes_btn.removeAllListeners();
        this.no_btn.removeAllListeners();
        this.current_tester.response( a );
        var c = this.current_tester.next();
        if ( !c ) {
            var b = this.current_tester.pass();
            var f = this.next_tester();
            if ( b && f ) {
                this.current_tester = f;
                this.show_interstitial()
            } else { this.fireEvent( "endoftest" ) }
        } else { this.update_word( c ) }
    },
    show_interstitial: function () {
        var a = Ext.get( this.interstitial ).child( "." + this.current_level );
        this.test_el.enableDisplayMode().hide();
        this.interstitial.show();
        a.slideIn( "l" ).pause( 4 ).ghost( "r", {
            useDisplay: true,
            callback: function () {
                this.update_first_word( this.current_tester.next() );
                this.progress();
                this.test_el.enableDisplayMode().show();
                this.interstitial.hide()
            },
            scope: this
        } )
    },
    set_yesno_handlers: function () {
        this.yes_btn.on( "click", function ( a ) { this.handle_button_click( a, "yes" ) }, this );
        this.no_btn.on( "click", function ( a ) { this.handle_button_click( a, "no" ) }, this )
    },
    display_result: function ( a, c ) {
        this.container_el.dom.innerHTML = a.responseText;
        var b = new Ext.util.DelayedTask( function () { Ext.get( "start-learning" ).fadeIn() } );
        b.delay( 2000 )
    },
    submit_test: function () {
        this.stop_clock();
        this.purgeListeners();
        this.keepalive_runner.stopAll();
        MB.spinnerOn( this.el );
        Ext.Ajax.request( { url: "calibration_test/calibrate", params: { data: this.server_string() }, method: "POST", success: this.display_result, retries: 3, timeout: 15000, standardMessageOnFailure: true, scope: this } );
        this.server_string()
    },
    server_string: function () {
        s = new Array();
        for ( var c = 1; c <= this.max_tested_levels; ++c ) {
            var b = this.level_testers[ c ];
            if ( b ) {
                var a = b.passed ? "PASSED" : "FAILED";
                s.push( { status: a, result: b.results() } )
            }
        }
        var e = new Date();
        var d = parseInt( e.getElapsed( this.start_time ) / 1000, 10 );
        return Ext.util.JSON.encode( { combined_response: s, time: d } )
    },
    update_first_word: function ( a ) {
        this.level_progress = -1;
        this.el.update( a ).fadeIn( { easing: "backIn", scope: this } );
        this.container_el.addClass( "calibration" + this.current_level )
    },
    update_word: function ( a ) { this.el.update( a ).fadeIn( { easing: "backIn", callback: this.progress, scope: this } ) },
    progress: function ( b ) {
        this.level_progress += 1;
        var c = this.level_progress / ( this.current_tester.size );
        var a = parseInt( c * 100, 10 ) + "% complete";
        this.pbar.updateProgress( c, a )
    },
    build_progress_bar: function ( a ) {
        this.pbar = new Ext.ProgressBar( { renderTo: a, animate: true } );
        this.pbar.on( "update", function ( d, c, b ) { this.set_yesno_handlers() }, this )
    },
    start_clock: function ( c ) {
        if ( !this.start_time ) { this.start_time = new Date() }
        var b = this.start_time;
        var a = {
            run: function () {
                var g = new Date();
                var j = parseInt( g.getElapsed( b ) / 1000, 10 );
                var d = Math.floor( j / 60 );
                var f = j % 60;
                var h = d < 10 ? "0" + d : d;
                var e = f < 10 ? "0" + f : f;
                Ext.fly( c ).update( h + ":" + e )
            },
            interval: 1000
        };
        this.runner = new Ext.util.TaskRunner();
        this.runner.start( a )
    },
    stop_clock: function () { this.runner.stopAll() }
} );
MB.LevelTester = function ( b, a, c ) {
    this.realwords = b;
    this.psuedowords = a;
    this.size = this.realwords.length + this.psuedowords.length;
    this.real_idx = 0;
    this.psuedo_idx = 0;
    this.current_word = { wordform: null, psuedo: false };
    this.tested_words = new Array();
    this.max_score = this.realwords.length;
    this.score = 0;
    this.pass_percentage = 80;
    this.level = c
};
Ext.extend( MB.LevelTester, Ext.util.Observable, {
    next_psuedo: function () {
        var a = null;
        if ( this.psuedo_idx < this.psuedowords.length ) {
            a = this.psuedowords[ this.psuedo_idx ];
            this.psuedo_idx++
        }
        this.current_word = { wordform: a, psuedo: true };
        return a
    },
    next_real: function () {
        var a = null;
        if ( this.real_idx < this.realwords.length ) {
            a = this.realwords[ this.real_idx ];
            this.real_idx++
        }
        this.current_word = { wordform: a, psuedo: false };
        return a
    },
    next: function () { var a = ( Math.random() <= 0.25 ); var b = null; if ( a ) { if ( this.psuedo_idx < this.psuedowords.length ) { b = this.next_psuedo() } else { b = this.next_real() } } else { if ( this.real_idx < this.realwords.length ) { b = this.next_real() } else { b = this.next_psuedo() } } return b },
    response: function ( a ) {
        if ( a === "yes" ) {
            this.tested_words.push( { word: this.current_word, response: "yes" } );
            this.current_word.psuedo ? this.score-- : this.score++
        } else { this.tested_words.push( { word: this.current_word, response: "no" } ) }
    },
    pass: function () {
        var a = ( this.score / this.max_score ) * 100;
        this.passed = ( a >= this.pass_percentage );
        return this.passed
    },
    results: function () { return this.tested_words }
} );
Ext.onReady( function () {
    if ( !Ext.get( "calibration_tests" ) ) { return }
    if ( !Ext.get( "wordlist" ) ) { return } Ext.select( "#skip > a" ).on( "click", function ( b, a ) {
        b.stopEvent();
        Ext.Msg.show( { title: Ext.select( "#skip-message .title" ).first().dom.innerHTML, msg: Ext.select( "#skip-message .message" ).first().dom.innerHTML, fn: function ( c ) { if ( c === "yes" ) { window.location = a.href } }, icon: Ext.MessageBox.QUESTION, buttons: Ext.Msg.YESNO } )
    } );
    Ext.select( "#start-btn" ).on( "click", function ( b, a ) {
        b.stopEvent();
        Ext.get( "init-screen" ).enableDisplayMode().fadeOut( {
            callback: function () {
                Ext.get( "test-screen" ).fadeIn();
                var j = Ext.get( "wordlist" ).dom.innerHTML;
                var k = Ext.util.JSON.decode( j );
                var h = k.real;
                var e = k.psuedo;
                var c = Ext.get( "calibration-test-wrapper" );
                var g = Ext.get( "calibration-word" );
                var f = Ext.get( "calibration-test" );
                var d = new MB.Tester( c, f, g, h, e );
                d.next;
                d.start_clock( "clock" )
            }
        } )
    } )
} );
Ext.onReady( function () {
    Ext.select( "#faqs dl" ).on( "click", function ( g, d ) { g.stopEvent(); var f = Ext.get( d ).next( "dd" ); if ( f ) { f.toggleClass( "hidden" ) } }, this, { delegate: "dt" } );
    Ext.select( "#faqs .faq-control" ).on( "click", function ( h, d ) { h.stopEvent(); var g = Ext.get( d ); var f = g.parent( ".faq-collection" ); var j = f ? f.select( "dd" ) : Ext.select( "#faqs dd" ); if ( g.hasClass( "show-all" ) ) { j.each( function ( e ) { e.removeClass( "hidden" ) } ) } else { j.each( function ( e ) { e.addClass( "hidden" ) } ) } }, this, { delegate: "a" } );
    var a = Ext.get( "faqs" ) || Ext.select( ".faqs" ).first();
    if ( a ) {
        var b = location.hash;
        b = b.slice( 1, b.length );
        var c = Ext.get( b );
        if ( c ) { c.next( "dd" ).removeClass( "hidden" ) } Ext.getBody().on( "click", function ( f ) { var d = f.getTarget().href; var g = Ext.get( d ); if ( g ) { g.next( "dd" ).removeClass( "hidden" ) } }, this, { delegate: ".faqlink" } )
    }
} );
Ext.onReady( function () { if ( Ext.getBody().hasClass( "mkting" ) || Ext.get( "helptexts" ) || Ext.get( "surveys" ) ) { MB.activateEmbeddedVideos() } } );
/*!
 * Ext JS Library 3.3.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
;
Ext.ns( "Ext.ux" );
Ext.ux.JSONP = ( function () {
    var c = [],
        b = null,
        a = function () {
            b = null;
            if ( c.length ) {
                b = c.shift();
                b.script.src = b.url + "?" + b.params;
                document.getElementsByTagName( "head" )[ 0 ].appendChild( b.script )
            }
        };
    return {
        request: function ( e, h ) {
            if ( !e ) { return }
            var f = this;
            h.params = h.params || {};
            if ( h.callbackKey ) { h.params[ h.callbackKey ] = "Ext.ux.JSONP.callback" }
            var g = Ext.urlEncode( h.params );
            var d = document.createElement( "script" );
            d.type = "text/javascript";
            if ( h.isRawJSON ) { if ( Ext.isIE ) { Ext.fly( d ).on( "readystatechange", function () { if ( d.readyState == "complete" ) { var j = d.innerHTML; if ( j.length ) { f.callback( Ext.decode( j ) ) } } } ) } else { Ext.fly( d ).on( "load", function () { var j = d.innerHTML; if ( j.length ) { f.callback( Ext.decode( j ) ) } } ) } } c.push( { url: e, script: d, callback: h.callback || function () { }, scope: h.scope || window, params: g || null } );
            if ( !b ) { a() }
        },
        callback: function ( d ) {
            b.callback.apply( b.scope, [ d ] );
            Ext.fly( b.script ).removeAllListeners();
            document.getElementsByTagName( "head" )[ 0 ].removeChild( b.script );
            a()
        }
    }
} )();
MB.LandingSlideShow = Ext.extend( Ext.util.Observable, {
    constructor: function ( c, b, d, a ) {
        this.slides = c;
        this.leftArr = b;
        this.rightArr = d;
        this.buttonContainer = a;
        this.buttons = a.select( ".numbered-btn" );
        this.numSlides = this.buttons.getCount();
        this.addListeners();
        this.curIdx = 0;
        this.nextIdx = 0;
        this.wrapAround = false;
        Ext.select( "video" ).hide();
        this.pauseAutoAdvance = false;
        this.nextAdvanceTask = new Ext.util.DelayedTask( this.next.createDelegate( this ) );
        this.nextAdvanceTask.delay( 10000 )
    },
    previous: function () {
        if ( this.nextIdx != 0 ) {
            this.nextIdx -= 1;
            this.transition()
        }
    },
    next: function () {
        if ( this.nextIdx < this.numSlides - 1 ) { this.nextIdx += 1; if ( !this.pauseAutoAdvance ) { this.nextAdvanceTask.delay( 6000 ) } } else {
            this.nextIdx = 0;
            this.wrapAround = true
        }
        this.transition()
    },
    addListeners: function () {
        this.buttonContainer.on( "click", function ( c ) {
            c.stopEvent();
            var b = c.getTarget( "li", 2, true );
            if ( b ) {
                var a = b.child( "a" );
                if ( a ) {
                    this.nextIdx = parseInt( a.getText(), 10 ) - 1;
                    this.transitionJump()
                }
            }
        }, this );
        this.leftArr.on( "click", function ( a ) {
            a.stopEvent();
            this.nextAdvanceTask.cancel();
            this.previous()
        }, this );
        this.rightArr.on( "click", function ( a ) {
            a.stopEvent();
            this.nextAdvanceTask.cancel();
            this.next()
        }, this );
        Ext.getBody().on( "mouseover", function ( c, a ) { var b = Ext.get( this.rightArr ); if ( !b.isVisible() ) { b.fadeIn() } }, this, { delegate: "#front-slide" } );
        Ext.getBody().on( "click", function ( b, a ) {
            this.nextAdvanceTask.cancel();
            this.pauseAutoAdvance = true
        }, this, { delegate: ".video-link" } );
        Ext.getBody().on( "click", function ( b, a ) {
            this.pauseAutoAdvance = true;
            this.nextAdvanceTask.cancel()
        }, this, { delegate: "#wt-video_wrapper" } )
    },
    transition: function () {
        if ( this.curIdx != this.nextIdx ) {
            this.buttons.item( this.curIdx ).removeClass( "current" );
            if ( this.nextIdx > this.curIdx || this.wrapAround ) {
                this.slides.item( this.curIdx ).slideOut( "l" );
                this.slides.item( this.nextIdx ).slideIn( "r" )
            } else {
                this.slides.item( this.curIdx ).slideOut( "r" );
                this.slides.item( this.nextIdx ).slideIn( "l" )
            }
            this.buttons.item( this.nextIdx ).addClass( "current" );
            this.curIdx = this.nextIdx;
            this.wrapAround = false
        }
        if ( this.curIdx == 0 ) { Ext.get( "slideshow-left" ).hide() } else { Ext.get( "slideshow-left" ).show() }
    },
    transitionJump: function () {
        if ( this.curIdx != this.nextIdx ) {
            this.buttons.item( this.curIdx ).removeClass( "current" );
            this.slides.item( this.curIdx ).fadeOut();
            this.slides.item( this.nextIdx ).fadeIn();
            this.buttons.item( this.nextIdx ).addClass( "current" );
            this.curIdx = this.nextIdx
        }
        this.nextAdvanceTask.cancel()
    }
} );
Ext.onReady( function () { if ( Ext.getBody().hasClass( "landing" ) ) { MB.setAffliateCookie(); if ( Ext.get( "tour" ) ) { var b = new MB.SlideShow( "tour", { itemSelector: ".tour-img", interval: 4 } ) } if ( Ext.get( "slideshow-nav" ) ) { var a = new MB.LandingSlideShow( Ext.select( ".slide" ), Ext.get( "slideshow-left" ), Ext.get( "slideshow-right" ), Ext.get( "slideshow-nav" ) ) } } } );
Ext.onReady( function () {
    if ( !Ext.get( "plans" ) ) { return }
    var b = Ext.get( "treemap" );
    var a = b.child( ".data_url" ).getText();
    Ext.get( "treemap-container" ).on( "click", function ( c ) {
        c.stopEvent();
        membean_zoom_treemap( a, 0 )
    } );
    Ext.select( "#wordset img" ).each( function ( c ) { c.addClassOnOver( "viz-over" ) } );
    if ( false ) { swfobject.embedSWF( "/flash/Treemap.swf", b.dom.id, 1, 1, "9.0.0", "/flash/expressInstall.swf", { data: a, zoom: 1 }, { wmode: "opaque" }, { id: "treemap-flash" } ) }
} );
var membean_zoom_treemap = function ( a, c ) {
    if ( Shadowbox ) {
        var b = { data: a, zoom: 1, index: c };
        Shadowbox.open( { title: "Alphabetized Word Distribution by difficulty", player: "swf", content: "/flash/Treemap.swf", height: 600, width: 800, options: { flashVars: b } }, { animate: true } )
    }
};
MB.SlideShow = Ext.extend( Ext.util.Observable, {
    interval: 3,
    transitionDuration: 1,
    itemSelector: "img",
    freezeOnHover: true,
    constructor: function ( b, a ) {
        a = a || {};
        Ext.apply( this, a );
        MB.SlideShow.superclass.constructor.call( this, a );
        this.addEvents( "next", "play", "freeze", "unfreeze" );
        this.el = Ext.get( b );
        this.slides = this.els = [];
        this.initMarkup();
        if ( this.size > 0 ) { this.refresh() }
    },
    initMarkup: function () {
        var a = Ext.DomHelper;
        this.size = 0;
        this.els.container = a.append( this.el, { cls: "mb-slideshow-container" }, true );
        this.els.slidesWrap = a.append( this.els.container, { cls: "mb-slideshow-slides-wrap" }, true );
        this.slideWidth = this.el.getWidth( true );
        this.slideHeight = this.el.getHeight( true );
        this.els.container.setStyle( { width: this.slideWidth + "px", height: this.slideHeight + "px" } );
        this.el.select( this.itemSelector ).appendTo( this.els.slidesWrap ).each( function ( d, e, b ) {
            d.removeClass( "hidden" );
            d = d.wrap( { cls: "mb-slideshow-slide" } );
            this.slides.push( d );
            d.setWidth( this.slideWidth + "px" ).setHeight( this.slideHeight + "px" );
            if ( b != 0 ) { d.hide() }
        }, this );
        this.play();
        if ( this.freezeOnHover ) {
            this.els.container.on( "mouseenter", function () {
                if ( this.playing ) {
                    this.fireEvent( "freeze", this.slides[ this.activeSlide ] );
                    Ext.TaskMgr.stop( this.playTask )
                }
            }, this );
            this.els.container.on( "mouseleave", function () {
                if ( this.playing ) {
                    this.fireEvent( "unfreeze", this.slides[ this.activeSlide ] );
                    Ext.TaskMgr.start( this.playTask )
                }
            }, this, { buffer: ( this.interval / 2 ) * 1000 } )
        }
    },
    play: function () {
        if ( !this.playing ) {
            this.playTask = this.playTask || {
                run: function () {
                    this.playing = true;
                    this.setSlide( this.activeSlide + 1 )
                },
                interval: this.interval * 1000,
                scope: this
            };
            this.playTaskBuffer = this.playTaskBuffer || new Ext.util.DelayedTask( function () { Ext.TaskMgr.start( this.playTask ) }, this );
            this.playTaskBuffer.delay( this.interval * 1000 );
            this.playing = true;
            this.fireEvent( "play" )
        }
        return this
    },
    setSlide: function ( a ) {
        if ( !this.slides[ a ] ) {
            a = 1;
            this.activeSlide = this.slides.length - 1
        }
        this.slides[ this.activeSlide ].fadeOut();
        this.slides[ a ].fadeIn();
        this.activeSlide = a
    },
    pause: function () {
        if ( this.playing ) {
            Ext.TaskMgr.stop( this.playTask );
            this.playTaskBuffer.cancel();
            this.playing = false;
            this.fireEvent( "pause" )
        }
        return this
    }
} );
Ext.onReady( function () {
    if ( !Ext.get( "surveys" ) ) { return } Ext.select( "textarea" ).addClassOnFocus( "active" );
    Ext.select( 'input[type="text"]' ).addClassOnFocus( "active" )
} );
var membean_zoom_wordball = function ( a ) {
    if ( Shadowbox ) {
        var b = { data: a };
        Shadowbox.open( { title: "Word Ball", player: "swf", content: "/flash/WordGlobe.swf", height: 600, width: 800, options: { flashVars: b } } )
    }
};
MB.embedWordBall = function ( b ) {
    var c = Ext.get( "wordball" );
    if ( c ) {
        var a = c.child( ".data-url" ).getText();
        if ( !b ) { swfobject.embedSWF( "/flash/WordCloud.swf", c.dom.id, 1, 1, "9.0.0", "/flash/expressInstall.swf", { data: a }, { wmode: "opaque", allowFullScreen: "true" }, { id: "wordball-flash" } ) } else {
            Ext.get( b ).on( "click", function ( d ) {
                d.stopEvent();
                membean_zoom_wordball( a )
            } )
        }
    }
};
Ext.onReady( function () { var a = Ext.get( "user_exam_date" ); if ( a ) { var b = new MB.Calendar( { clickElement: a, tiedToTextField: "user_exam_date" } ) } } );
MB.affliateCharts = function () {
    var g = new google.visualization.DataTable();
    g.addColumn( "string", "Product" );
    g.addColumn( "number", "Students" );
    var e = Ext.util.JSON.decode( Ext.get( "all-signups-data" ).dom.innerHTML );
    g.addRows( e );
    var c = new google.visualization.DataTable();
    c.addColumn( "string", "Product" );
    c.addColumn( "number", "Students" );
    var a = Ext.util.JSON.decode( Ext.get( "paid-signups-data" ).dom.innerHTML );
    c.addRows( a );
    var k = { width: 250, chartArea: { left: 30, bottom: 10 }, pieSliceText: "value", pieSliceTextStyle: { color: "black" }, colors: [ "#CDC4F1", "#BAEDED", "#9EB2DD", "#E3EBFE", "#AD9FDE" ], height: 150 };
    var f = new google.visualization.PieChart( document.getElementById( "all-signups-chart" ) );
    chart_options = k;
    chart_options.title = "Introduced By Product";
    f.draw( g, chart_options );
    var b = new google.visualization.PieChart( document.getElementById( "paid-signups-chart" ) );
    chart1_options = k;
    chart1_options.title = "Paid By Product";
    b.draw( c, chart1_options );
    var j = new google.visualization.DataTable();
    j.addColumn( "string", "Week" );
    j.addColumn( "number", "Number of Students" );
    var h = Ext.util.JSON.decode( Ext.get( "all-signups-by-month-data" ).dom.innerHTML );
    j.addRows( h );
    var d = new google.visualization.AreaChart( document.getElementById( "all-signups-by-month" ) );
    d.draw( j, { width: 400, height: 240, chartArea: { left: 50, top: 50, width: "95%" }, hAxis: { slantedText: true, textPosition: "out", textStyle: { fontSize: 9, color: "#3366cc" } }, legend: "top", title: "Number of Sign Ups" } )
};
Ext.onReady( function () {
    if ( !Ext.get( "affliates" ) ) { return } Date.useStrict = true;
    var b = Ext.select( "#affliate-user-details table" ).first();
    if ( b ) {
        var a = new Ext.ux.grid.TableGrid( b, { stripeRows: true, fields: [ { type: "string" }, { type: "string" }, { type: "string" }, { type: "date", dateFormat: "M d, y" } ], columns: [ { sortable: true }, { sortable: true }, { sortable: true }, { sortable: true, renderer: Ext.util.Format.dateRenderer( "M d, y" ) } ] } );
        a.render()
    }
    if ( Ext.get( "all-signups-chart" ) ) { google.load( "visualization", "1.0", { packages: [ "corechart" ], callback: MB.affliateCharts } ) }
} );

// IMPORTANT ??
MB.Timer = Ext.extend( Ext.util.Observable, {
    constructor: function ( a ) {
        this.config = a || {};
        Ext.apply( this, a, { nsecs: 10 } );
        MB.Timer.superclass.constructor.call( this, a );
        this.addEvents( { timedOut: true } );
        this.pbar = new Ext.ProgressBar( { renderTo: this.config.renderTo, height: this.config.height || 20, width: "90%", cls: this.config.cls || "timer" } )
    },
    start: function () {
        this.startTimer = new Date();
        this.pbar.wait( { text: this.text || "Allotted time", duration: this.nsecs * 1000, interval: 500, scope: this, increment: ( this.nsecs * 1000 ) / 500, fn: function () { this.fireEvent( "timedOut" ) } }, this )
    },
    max: function () { this.pbar.updateProgress( 1 ) },
    stop: function () { this.pbar.reset() },
    elapsedSinceStart: function () { var a = new Date(); return a.getElapsed( this.startTimer ) / 1000 }
} );

// IMPORTANT ??
MB.AssessmentTimer = Ext.extend( MB.Timer, {
    constructor: function ( a ) {
        MB.AssessmentTimer.superclass.constructor.call( this, a );
        this.warningTimeout = 60;
        this.dangerTimeout = 30;
        this.addEvents( { almostTimedOut: true } )
    },
    start: function () { MB.AssessmentTimer.superclass.start.call( this ); if ( this.nsecs > this.dangerTimeout ) { setTimeout( this.danger.createDelegate( this ), ( this.nsecs - this.dangerTimeout ) * 1000 ) } if ( this.nsecs > this.warningTimeout ) { setTimeout( this.warning.createDelegate( this ), ( this.nsecs - this.warningTimeout ) * 1000 ) } },
    danger: function () { this.fireEvent( "almostTimedOut", "danger", this.dangerTimeout ) },
    warning: function () { this.fireEvent( "almostTimedOut", "warning", this.warningTimeout ) }
} );

// IMPORTANT
MB.Assessment = Ext.extend( Ext.util.Observable, {
    constructor: function ( a ) {
        this.config = a || {};
        this.form = Ext.select( "form" ).first();
        this.timedOut = false;
        this.warnedWindowCount = 0;
        if ( this.form ) {
            this.submitBtn = this.form.child( ".submit-btn" );
            this.timer = this.buildTimer();
            Ext.apply( this, a );
            this.addListeners();
            this.clear()
        }
    },
    buildTimer: function () {
        var a = Ext.get( "assessment-timeout" ).dom.getAttribute( "data-timeout" );
        a = parseInt( a, 10 );
        var b = Math.floor( a / 60 );
        var d = a % 60;
        var c = b + "m:" + d + "s";
        var e = new MB.AssessmentTimer( { renderTo: Ext.get( "assessment-timer-holder" ), cls: "assessment-timer", text: c, nsecs: a } );
        return e
    },
    questionHighlight: function ( c, a ) { var a = Ext.get( a ); var b = a.parent( ".pop-quiz-question" ); if ( b ) { b.addClass( "answered" ) } },
    addListeners: function () {
        this.timer.on( "almostTimedOut", function ( a, b ) {
            Ext.getBody().addClass( "almost-timed-out-" + a );
            MB.growl( b + " seconds left" )
        } );
        this.timer.on( "timedOut", function () {
            Ext.getBody().mask();
            this.timedOut = true;
            var a = this.timer.elapsedSinceStart();
            Ext.get( "time_spent" ).dom.value = a;
        }, this );
        this.submitBtn.on( "click", function ( c, b ) { var a = Ext.get( "time_spent" ); if ( a ) { a.dom.value = this.timer.elapsedSinceStart() } }, this );
        this.form.on( "submit", function ( f, c ) {
            if ( this.timedOut ) { return true }
            if ( this.skipUnansweredWarning ) { return true }
            var d = [];
            Ext.select( ".pop-quiz-question" ).each( function ( e ) { if ( Ext.get( e ).query( "input[type=radio]:checked" ).length == 0 ) { d.push( Ext.get( e.dom ) ) } } );
            if ( d.length > 0 ) {
                var b = confirm( "Some questions are unanswered. Press 'Cancel' if you want to answer these questions before submitting the test. Press 'OK' if you want to submit the test." );
                for ( var a = 0; a < d.length; ++a ) {
                    el = d[ a ];
                    el.addClass( "unanswered" )
                }
                if ( !b ) { f.preventDefault() }
            }
        }, this );
        Ext.getBody().on( { click: this.questionHighlight, tap: this.questionHighlight, scope: this, delegate: "input[type=radio]" } );
        this.form.on( "keydown", function ( a ) { if ( a.keyCode == 13 ) { a.preventDefault(); return false } } )
    },
    preventFocusChange: function () {
        var a = this;
        var c = function () {
            var e = a.warnedWindowCount > 0;
            if ( e && a.delayExceeded ) {
                a.delayExceeded = false;
                a.abortOnFocusLoss();
                alert( "You moved away from the assessment window again. Terminating test!" )
            } else {
                if ( !e ) {
                    var d = alert( "Do not leave this window. Your test will be terminated if you do this again. Click OK right now!" );
                    a.warnedWindowCount += 1;
                    setTimeout( function () { a.delayExceeded = true }, 10000 )
                }
            }
        };
        var b = function ( f, d ) { if ( Visibility.hidden() ) { c() } };
        setInterval( function () { if ( !document.hasFocus() ) { c() } }, 10000 );
        Visibility.change( b )
    },
    abortOnFocusLoss: function () {
        this.skipUnansweredWarning = true;
        $( "#lost_focus" ).val( "true" );
        this.submitBtn.dom.click();
        this.form.mask()
    },
    start: function () { this.timer.start() },
    clear: function () {
        Ext.select( "input[type='radio']" ).each( function ( a ) { a.dom.checked = false } );
        Ext.select( ".pop-quiz-question" ).removeClass( "answered" )
    }
} );
MB.AssessmentMakerUpper = Ext.extend( Ext.util.Observable, {
    constructor: function ( a ) {
        this.config = a || {};
        this.formEl = Ext.select( "#makeup-student-list form" ).first();
        this.basicForm = new Ext.form.BasicForm( this.formEl );
        if ( this.formEl ) {
            this.submitBtn = this.formEl.child( ".submit-btn" );
            this.makeupBtn = Ext.get( "makeup-test-btn" );
            this.studentListEl = Ext.get( "makeup-student-list" );
            Ext.apply( this, a );
            this.addListeners()
        }
    },
    addListeners: function () {
        this.makeupBtn.on( "click", function ( a ) {
            a.stopEvent();
            this.studentListEl.enableDisplayMode().fadeIn()
        }, this );
        this.submitBtn.on( "click", function ( b ) {
            var a = 0;
            Ext.select( "input[type='checkbox']" ).each( function ( c ) { if ( c.dom.checked ) { a += 1 } } );
            if ( a == 0 ) { Ext.Msg.show( { msg: "Please select the students that need a make up test by checking the box before their name.", width: 350, cls: "help-text", buttons: Ext.MessageBox.OK, icon: Ext.MessageBox.ERROR } ); return false } MB.spinnerOn( this.submitBtn.parent() );
            this.submitBtn.dom.disabled = true;
            this.basicForm.submit( {
                success: function ( c, d ) {
                    this.submitBtn.dom.disabled = false;
                    this.updateWithResponse( d.result )
                },
                failure: MB.AjaxGenericFailureMsg,
                scope: this
            } )
        }, this )
    },
    updateWithResponse: function ( b ) {
        var a = b.data.table;
        this.redrawSummaryTable( a );
        var c = b.data.status_by_user;
        this.showNewAssessmentStatus( c )
    },
    redrawSummaryTable: function ( a ) {
        var c = Ext.get( "assessmentset-table-summary" );
        c.dom.innerHTML = a;
        var b = c.child( "table" );
        MB.makeAssessmentSortableTable( b )
    },
    showNewAssessmentStatus: function ( c ) {
        for ( var f in c ) {
            var b = c[ f ];
            var e = Ext.get( f );
            var d = e.child( ".status" );
            var a = e.child( "input[type=checkbox]" );
            d.show();
            switch ( b ) {
                case "partial":
                    d.addClass( "partial" );
                    d.dom.innerHTML = "ok";
                    break;
                case "not_enough_words":
                    d.addClass( "no-words" );
                    d.dom.innerHTML = "insufficent practice";
                    break;
                case "good":
                    d.addClass( "good" );
                    d.dom.innerHTML = "ok";
                    break;
                case "locked":
                    d.addClass( "locked" );
                    d.dom.innerHTML = "locked";
                    break
            }
            a.dom.disabled = true
        }
    }
} );
MB.AssessmentRetaker = Ext.extend( Ext.util.Observable, {
    constructor: function ( a ) {
        this.config = a || {};
        this.formEl = Ext.select( "#retake-student-list form" ).first();
        this.basicForm = new Ext.form.BasicForm( this.formEl );
        if ( this.formEl ) {
            this.submitBtn = this.formEl.child( ".submit-btn" );
            this.makeupBtn = Ext.get( "retake-test-btn" );
            this.studentListEl = Ext.get( "retake-student-list" );
            Ext.apply( this, a );
            this.addListeners()
        }
    },
    addListeners: function () {
        this.makeupBtn.on( "click", function ( a ) {
            a.stopEvent();
            this.studentListEl.enableDisplayMode().fadeIn()
        }, this );
        this.submitBtn.on( "click", function ( b ) {
            var a = 0;
            Ext.select( "input[type='checkbox']" ).each( function ( c ) { if ( c.dom.checked ) { a += 1 } } );
            if ( a == 0 ) { Ext.Msg.show( { msg: "Please select the students that need a retake by checking the box before their name.", width: 350, cls: "help-text", buttons: Ext.MessageBox.OK, icon: Ext.MessageBox.ERROR } ); return false } MB.spinnerOn( this.submitBtn.parent() );
            this.submitBtn.dom.disabled = true;
            this.basicForm.submit( {
                success: function ( c, d ) {
                    this.submitBtn.dom.disabled = false;
                    this.updateWithResponse( d.result )
                },
                failure: MB.AjaxGenericFailureMsg,
                scope: this
            } )
        }, this )
    },
    updateWithResponse: function ( b ) {
        var a = b.data.table;
        this.redrawSummaryTable( a );
        var c = b.data.status_by_user;
        this.showNewAssessmentStatus( c )
    },
    redrawSummaryTable: function ( a ) {
        var c = Ext.get( "assessmentset-table-summary" );
        c.dom.innerHTML = a;
        var b = c.child( "table" );
        MB.makeAssessmentSortableTable( b )
    },
    showNewAssessmentStatus: function ( c ) {
        for ( var f in c ) {
            var b = c[ f ];
            var e = Ext.get( f );
            var d = e.child( ".status" );
            var a = e.child( "input[type=checkbox]" );
            d.show();
            switch ( b ) {
                case "partial":
                    d.addClass( "partial" );
                    d.dom.innerHTML = "ok";
                    break;
                case "not_enough_words":
                    d.addClass( "no-words" );
                    d.dom.innerHTML = "insufficent practice";
                    break;
                case "good":
                    d.addClass( "good" );
                    d.dom.innerHTML = "ok";
                    break;
                case "locked":
                    d.addClass( "locked" );
                    d.dom.innerHTML = "locked";
                    break
            }
            a.dom.disabled = true
        }
    }
} );
MB.makeAssessmentSortableTable = function ( a ) { if ( a ) { var b = new Ext.ux.grid.TableGrid( a, { stripeRows: true, fields: [ { type: "string" }, { type: "string" }, { type: "string" }, { type: "string" }, { type: "string" }, { type: "string" } ] } ) } };
Ext.onReady( function () {
    if ( !( Ext.get( "assessment_sets" ) || Ext.get( "assessments" ) ) ) { return }
    var b = Ext.select( "#assessment-set-list table" );
    b.each( function ( c ) { MB.makeAssessmentSortableTable( c ) } );
    if ( Ext.get( "assessment-form" ) ) {
        var a = new MB.Assessment();
        a.start();
        Ext.getBody().on( "contextmenu", function ( c ) { c.preventDefault() } )
    }
    if ( Ext.get( "assessment_sets" ) ) {
        new MB.AssessmentMakerUpper();
        new MB.AssessmentRetaker()
    }
} );
MB.activateEducatorBookSearch = function () {
    var b = new Ext.data.Store( { proxy: new Ext.data.HttpProxy( { url: "/booklist.json", method: "GET" } ), reader: new Ext.data.JsonReader( { root: "rows", totalProperty: "results", id: "book_id" }, [ { name: "bookname", mapping: "bookname" }, { name: "sd", mapping: "sd" } ] ) } );
    var c = new Ext.XTemplate( '<tpl for="."><div class="search-item">', "<h4>{bookname}</h4>", "<p>{sd}<p>", "</div></tpl>" );
    var a = new Ext.form.ComboBox( {
        store: b,
        width: 250,
        displayField: "title",
        typeAhead: false,
        loadingText: "Searching...",
        pageSize: 10,
        hideTrigger: true,
        tpl: c,
        minChars: 1,
        emptyText: "Type a book name",
        applyTo: "booksearch",
        itemSelector: "div.search-item",
        onSelect: function ( d ) {
            MB.spinnerOn( Ext.get( "booksearch" ) );
            window.open( String.format( "/books/{0}", d.data.bookname ), "_blank" );
            a.reset()
        }
    } )
};
Ext.onReady( function () { if ( Ext.get( "booksearch" ) ) { MB.activateEducatorBookSearch() } } );
MB.Calendar = function ( a ) {
    this.config = a;
    this.boundEl = Ext.get( a.tiedToTextField );
    this.showConfirmation = a.showConfirmation || false;
    this.confirmationText = a.confirmationText || "Are you sure?";
    this.clickElement = a.clickElement;
    this.renderTo = a.renderTo;
    this.addEvents( "select" );
    this.addListeners()
};
Ext.extend( MB.Calendar, Ext.util.Observable, {
    makeCalendarImpl: function () {
        var b = this.config.minDate || ( new Date() ).add( Date.DAY, 3 );
        var c = this.config.maxDate || b.add( Date.YEAR, 1 );
        var e = new Ext.DatePicker( { renderTo: document.body, minDate: b, maxDate: c, showToday: false } );
        var d = [ this.clickElement.getX(), this.clickElement.getY() ];
        var a = e.getEl();
        if ( this.clickElement.dom.type == "text" ) { d[ 1 ] = this.clickElement.getY() + this.clickElement.getHeight() + 10 } a.setXY( d );
        a.setStyle( "z-index", 99999 );
        return e
    },
    destroyCalendarOnOutsideClick: function () { Ext.getBody().on( "click", function () { this.destroy() }, this ) },
    addListeners: function () {
        this.clickElement.on( "click", function ( a ) { a.stopEvent(); if ( this.showConfirmation ) { Ext.Msg.show( { msg: this.confirmationText, icon: Ext.Msg.WARNING, modal: false, buttons: Ext.Msg.OKCANCEL, animEl: a.getTarget(), cls: "help-text", scope: this, fn: function ( b ) { if ( b === "ok" ) { this.addSelectEvent() } }, width: 350 } ) } else { this.addSelectEvent() } }, this );
        this.destroyCalendarOnOutsideClick();
        this.bindToTiedElement()
    },
    addSelectEvent: function () {
        this.cal = this.cal || this.makeCalendarImpl();
        this.cal.on( "select", function ( b, a ) { this.fireEvent( "select", a ) }, this, { stopEvent: true } )
    },
    destroy: function () {
        if ( this.cal && this.cal.isVisible() ) {
            this.cal.destroy();
            this.cal = null
        }
    },
    bindToTiedElement: function () {
        if ( this.boundEl ) {
            this.on( "select", function ( a ) {
                this.boundEl.dom.value = ( a.format( "Y/m/d" ) );
                this.boundEl.highlight();
                this.destroy()
            }, this );
            this.boundEl.on( "focus", function ( a ) {
                a.stopEvent();
                this.addSelectEvent()
            }, this )
        }
    }
} );
MB.DashPanel = Ext.extend( Ext.util.Observable, {
    constructor: function ( a ) {
        this.containerEl = Ext.get( a );
        this.containerX = this.containerEl.getX();
        this.containerY = this.containerEl.getY();
        this.panelTitle = this.containerEl.child( ".header" );
        this.contentEl = this.containerEl.child( ".content" );
        this.contentEl.enableDisplayMode();
        this.startY = this.containerEl.getY();
        this.dict = new MB.FastDict( { wrapperEl: this.containerEl } );
        this.contentVisible = false;
        this.constButton = Ext.get( "wordmap-page-link" );
        this.fastdictButton = Ext.get( "fastdict-page-link" );
        this.constellation = MB.embedWordMap( { width: 470, height: 400, word: "neophyte", wordsearch: "true", renderTo: "wordmap", callback: "membean_dashboard_constellation_callback" } );
        this.addListeners()
    },
    addListeners: function () {
        if ( this.panelTitle ) {
            this.panelTitle.on( "click", function ( a ) {
                a.stopEvent();
                this.showHidePanel()
            }, this );
            this.dict.on( "changedWord", function ( a ) { this.constellation.dom.changeWord( a ) }, this )
        }
    },
    showHidePanel: function () {
        if ( !this.contentVisible ) {
            this.contentEl.slideIn( "t", {
                useDisplay: true,
                scope: this,
                callback: function () {
                    this.panelTitle.dom.innerHTML = "Click to close";
                    this.contentVisible = true
                }
            } )
        } else {
            this.contentEl.slideOut( "b", {
                useDisplay: true,
                scope: this,
                callback: function () {
                    this.panelTitle.dom.innerHTML = "Enhanced Dictionary";
                    this.contentVisible = false
                }
            } )
        }
    },
    showDefn: function ( a ) {
        this.dict.displayWordDefn( a, true );
        this.fastdictButton.dom.href = "/fastdict?word=" + a;
        this.constButton.dom.href = "/wordmaps?wordform=" + a
    }
} );
MB.activateDashPanel = function () { };
membean_dashboard_constellation_callback = function ( a ) { if ( MB.dashPanel ) { MB.dashPanel.showDefn( a ) } };
MB.activateSessionSwapper = function () {
    Ext.get( "session-nav" ).on( "click", function ( b ) {
        b.stopEvent();
        var a = Ext.fly( b.getTarget() );
        s = a.getAttribute( "sect" );
        if ( s ) {
            Ext.select( "#session-nav a" ).each( function ( c ) { c.removeClass( "current" ) } );
            a.addClass( "current" );
            Ext.select( ".session-wrapper" ).each( function ( c ) { c.enableDisplayMode(); if ( c.getAttribute( "id" ) == s ) { c.fadeIn() } else { c.hide() } } )
        }
    } )
};
MB.activateRefreshStats = function () {
    var a = Ext.get( "refresh-stats" );
    if ( a ) {
        a.on( "click", function ( c ) {
            c.stopEvent();
            var b = a.getAttribute( "user" );
            if ( b ) {
                MB.spinnerOn( a );
                Ext.Ajax.request( {
                    url: "users/" + b + "/learning_stats",
                    failure: MB.AjaxGenericFailureMsg,
                    success: function ( e ) {
                        stats = Ext.decode( e.responseText )[ "data" ];
                        var d = [ "strong", "good", "fair", "poor" ];
                        for ( var f = 0; f < d.length; ++f ) {
                            var h = d[ f ];
                            var j = "#global-session ." + h + " em";
                            var g = Ext.select( j ).first();
                            if ( g ) {
                                g.dom.innerHTML = stats[ f ];
                                g.highlight()
                            }
                        }
                    }
                } )
            }
        } )
    }
};
MB.activateEducatorWordSearch = function () {
    var b = new Ext.data.Store( { proxy: new Ext.data.HttpProxy( { url: "/products/educator/wordlist.json", method: "GET" } ), reader: new Ext.data.JsonReader( { root: "rows", totalProperty: "results", id: "word_id" }, [ { name: "wordform", mapping: "wordform" }, { name: "definition", mapping: "defn" } ] ) } );
    var c = new Ext.XTemplate( '<tpl for="."><div class="search-item">', "<h3>{wordform}</h3>", "{definition}", "</div></tpl>" );
    var a = new Ext.form.ComboBox( {
        store: b,
        displayField: "title",
        typeAhead: false,
        loadingText: "Searching...",
        pageSize: 10,
        hideTrigger: true,
        tpl: c,
        emptyText: "Start typing a word",
        minChars: 2,
        applyTo: "wordsearch",
        itemSelector: "div.search-item",
        onSelect: function ( d ) {
            MB.spinnerOn( Ext.get( "rootlist-panel" ) );
            window.open( String.format( "/mywords/{0}", d.data.wordform ), "_blank" );
            a.reset()
        }
    } )
};
MB.activateEducatorRootSearch = function () {
    var b = new Ext.data.Store( { proxy: new Ext.data.HttpProxy( { url: "/treelist.json", method: "GET" } ), reader: new Ext.data.JsonReader( { root: "rows", totalProperty: "results", id: "tree_id" }, [ { name: "rootform", mapping: "rootform" }, { name: "label", mapping: "label" }, { name: "meaning", mapping: "defn" } ] ) } );
    var c = new Ext.XTemplate( '<tpl for="."><div class="search-item">', "<h3>{rootform}</h3>", "{meaning}", "</div></tpl>" );
    var a = new Ext.form.ComboBox( {
        store: b,
        displayField: "title",
        typeAhead: false,
        loadingText: "Searching...",
        pageSize: 10,
        hideTrigger: true,
        tpl: c,
        minChars: 1,
        emptyText: "Start typing a root",
        applyTo: "rootsearch",
        itemSelector: "div.search-item",
        onSelect: function ( d ) {
            MB.spinnerOn( Ext.get( "rootsearch" ) );
            window.open( String.format( "/trees/{0}", d.data.label ), "_blank" );
            a.reset()
        }
    } )
};
Ext.onReady( function () {
    if ( !( Ext.get( "dashboards" ) || Ext.select( ".user-dashboard" ).first() ) ) { return } google.load( "visualization", "1.0", { packages: [ "annotatedtimeline" ], callback: MB.trainingSessionChart } );
    google.load( "visualization", "1.0", { packages: [ "corechart" ], callback: MB.nonFlashTrainingSessionChart } );
    MB.activateDashPanel();
    if ( Ext.get( "session-nav" ) ) {
        MB.activateSessionSwapper();
        MB.activateRefreshStats()
    }
    var e = Ext.get( "date-chooser" );
    if ( e ) {
        var c = new MB.Calendar( { clickElement: Ext.get( "date-chooser" ), showConfirmation: true, confirmationText: "The distance to your target/exam day determines how much practice a word needs.  If you change your target date the strength of already practiced words will also change to reflect readiness for the new date. If you push back your target date, some words that are currently considered ready might need to be practiced again. But don't worry &mdash; since these words are strong already, just a little more practice will make them ready for the new date." } );
        c.on( "select", function ( d ) {
            this.destroy();
            MB.spinnerOn( Ext.get( "exam-date" ) );
            Ext.Ajax.request( {
                url: "/classic_dashboard",
                method: "PUT",
                params: { new_date: d.format( "m/d/Y" ) },
                waitMsg: "Updating ...",
                failure: MB.ajaxFailureHandler,
                success: function ( f ) {
                    var g = Ext.decode( f.responseText );
                    el = Ext.get( "exam-date" ).child( "h2" );
                    el.update( g.data.exam_date );
                    el1 = Ext.get( "days-to-exam" ).child( "h2" );
                    el1.update( g.data.days_to_exam );
                    el.highlight();
                    el1.highlight()
                }
            } )
        } )
    }
    var a = Ext.get( "fastdict-btn" );
    if ( a ) { a.on( "click", function ( d ) { MB.dashPanel.showHidePanel.defer( 1000, MB.dashPanel ) } ) }
    var b = Ext.get( "payment-due" );
    if ( b ) { Ext.Ajax.request( { url: b.getAttribute( "data-url" ), failure: function () { }, success: function ( d ) { var f = Ext.decode( d.responseText ); if ( f.payment_due ) { Ext.get( "payment-due" ).removeClass( "invisible" ) } } } ) } Ext.select( "#wordball img" ).on( "click", function ( g, f ) {
        g.stopEvent();
        var d = f.getAttribute( "data-url" );
        membean_zoom_wordball( d )
    } );
    if ( Ext.get( "wordsearch" ) ) { MB.activateEducatorWordSearch() }
    if ( Ext.get( "rootsearch" ) ) { MB.activateEducatorRootSearch() } MB.closePanel();
    MB.trainingSummaryByDateRange()
} );
MB.trainingSessionChart = function () {
    if ( Ext.get( "ts-chart" ) ) {
        var j = new google.visualization.DataTable();
        j.addColumn( "date", "Date" );
        j.addColumn( "number", "Minutes" );
        var d = Ext.util.JSON.decode( Ext.get( "ts-chart-data" ).dom.innerHTML );
        var e = d.data;
        var h = d.init;
        var c = [];
        for ( var f = 0; f < e.length; ++f ) {
            var b = e[ f ][ 0 ];
            var a = e[ f ][ 1 ];
            c.push( [ Date.parseDate( b, "Y, m, d" ), a ] )
        }
        j.addRows( c );
        var g = new google.visualization.AnnotatedTimeLine( document.getElementById( "ts-chart" ) );
        g.draw( j, { annotationsWidth: 5, thickness: 1, fill: 40, colors: [ "green" ], zoomStartTime: new Date( h[ 0 ] ), zoomEndTime: new Date( h[ 1 ] ) } );
        google.visualization.events.addListener( g, "rangechange", function () { var n = g.getVisibleChartRange(); var o = c.filter( function ( u ) { var r = u[ 0 ]; return r >= n.start && r <= n.end } ); var m = 0; for ( var l = 0; l < o.length; ++l ) { m += o[ l ][ 1 ] } var k = Ext.select( "#ts-learning-graphs li.selected-interval em" ).first(); if ( k ) { k.dom.innerHTML = m } } )
    }
};
MB.nonFlashTrainingSessionChart = function () {
    if ( Ext.get( "ts-chart-noflash" ) ) {
        var a = new google.visualization.DataTable();
        a.addColumn( "string", "Date" );
        a.addColumn( "number", "Minutes" );
        var c = Ext.util.JSON.decode( Ext.get( "ts-chart-data" ).dom.innerHTML )[ "data" ];
        a.addRows( c );
        var b = new google.visualization.AreaChart( document.getElementById( "ts-chart-noflash" ) );
        b.draw( a, { width: 600, height: 240, chartArea: { left: 30, top: 20, width: "90%" }, hAxis: { slantedText: true, format: "MMM, d", textPosition: "out", textStyle: { fontSize: 9, color: "#3366cc" } }, legend: "top", title: "Study time over the last 60 days (you want this to be evenly spaced)" } )
    }
};
MB.trainingSummaryByDateRange = function () {
    if ( Ext.get( "study-by-date" ) ) {
        Ext.select( "#study-by-date form" ).on( "submit", function ( d ) {
            d.preventDefault();
            MB.spinnerOn( Ext.get( "study-by-date-result" ) );
            var c = Ext.select( "#study-by-date form" ).first().getAttribute( "data-src" );
            var a = Ext.get( "start_date" ).getValue();
            var f = Ext.get( "end_date" ).getValue();
            var b = !a.match( /Start/ ) && !f.match( /End/ );
            if ( a && f && b ) {
                Ext.Ajax.request( {
                    url: c,
                    method: "GET",
                    params: { start_date: a, end_date: f },
                    waitMsg: "Updating ...",
                    failure: MB.ajaxFailureHandler,
                    success: function ( k ) {
                        var e = Ext.decode( k.responseText );
                        var l = e.data.total_time;
                        Ext.get( "study-by-date-result" ).dom.innerHTML = "You've trained <em> " + l + "</em> min. in the selected time range.";
                        var g = e.data.name;
                        var n = e.data.performance[ "new" ];
                        var j = e.data.performance.incorrect;
                        var m = e.data.performance.correct;
                        Ext.get( "report-chart-data" ).dom.innerHTML = '[["' + g + '",' + [ n, j, m ] + "]]";
                        var o = j + m;
                        var h = "You've seen <em>" + n + "</em> new word(s) and answered <em>" + o + "</em> question(s). ";
                        if ( o > 0 ) { h += "Of these you’ve answered <em>" + j + "</em> incorrectly and <em>" + m + "</em> correctly." } Ext.get( "performance-summary" ).dom.innerHTML = h;
                        MB.activityChart()
                    }
                } )
            }
        } )
    }
};
Ext.ns( "MB.WordLayout" );
MB.WordLayout = function () {
    var a = [ { name: "Context & Definition", id: "l-context", pos: 0, col: 0 }, { name: "Memory Hooks", id: "l-memhook", pos: 1, col: 0 }, { name: "Example Sentences", id: "l-examples", pos: 2, col: 0 }, { name: "Word Ingredients", id: "l-structure", pos: 0, col: 1 }, { name: "Word Theater", id: "l-theater", pos: 1, col: 1 }, { name: "Word Constellation", id: "l-wordmap", pos: 2, col: 1 }, { name: "Related Words", id: "l-relatedwords", pos: 3, col: 1 }, { name: "Word Variants", id: "l-variants", pos: 4, col: 1 } ];
    var c = function ( e ) {
        var d = [];
        var f = a.filter( function ( g ) { return g.col == e } ).sort( function ( h, g ) { return h.pos - g.pos } );
        f.forEach( function ( g ) { d.push( { collapsible: false, title: g.name, frame: false, id: g.id } ) } );
        return d
    };
    var b = function () {
        Ext.select( "#wcol0 .x-portlet" ).each( function ( e, g, d ) {
            var f = a.filter( function ( h ) { return h.id == e.id } )[ 0 ];
            f.pos = d;
            f.col = 0
        } );
        Ext.select( "#wcol1 .x-portlet" ).each( function ( e, g, d ) {
            var f = a.filter( function ( h ) { return h.id == e.id } )[ 0 ];
            f.pos = d;
            f.col = 1
        } );
        Ext.get( "user_config_word_layout" ).dom.value = Ext.util.JSON.encode( a )
    };
    return { restoreState: function () { var e = Ext.get( "user_config_word_layout" ); if ( e && e.dom.value ) { var d = e.dom.value; if ( d.length > 1 ) { a = Ext.util.JSON.decode( d ) } } }, show: function () { new Ext.Panel( { border: false, width: 350, id: "layout-panel", renderTo: Ext.get( "word-layout" ), items: [ { xtype: "portal", border: false, items: [ { columnWidth: 0.55, id: "wcol0", items: c( 0 ) }, { columnWidth: 0.45, id: "wcol1", items: c( 1 ) } ], listeners: { validatedrop: function ( d ) { return "wcol" + ( d.columnIndex ) == d.panel.ownerCt.id }, drop: function ( d ) { b( d.panel, d.columnIndex, d.position ) } } } ] } ) } }
}();
Ext.onReady( function () {
    if ( Ext.get( "user_configs" ) ) {
        if ( Ext.get( "word-layout" ) ) {
            MB.WordLayout.restoreState();
            MB.WordLayout.show()
        }
    }
} );
MB.ClassEditor = Ext.extend( Ext.util.Observable, {
    constructor: function ( a ) {
        this.config = a || {};
        Ext.apply( this, a );
        MB.ClassEditor.superclass.constructor.call( this, a );
        this.setupHandlers()
    },
    setupHandlers: function () {
        Ext.select( ".edit-class" ).on( "click", function ( f, b ) {
            f.stopEvent();
            var d = Ext.get( b );
            if ( d ) {
                var c = d.dom.getAttribute( "data-class-id" );
                var a = d.up( ".teacher-panel" );
                this.editClass( a, c )
            }
        }, this )
    },
    addNewClass: function () {
        var b = Ext.get( "new-class-placeholder" );
        var a = this.template();
        b.insertHtml( "afterBegin", a, true );
        b.fadeIn()
    },
    editClass: function ( a, c ) {
        var b = this.template();
        a.insertHtml( "beforeEnd", b, true );
        a.fadeIn()
    },
    template: function () { return Ext.get( "add-class-editor-template" ).dom.innerHTML }
} );
MB.SchoolEditor = Ext.extend( Ext.util.Observable, {
    constructor: function ( a ) {
        this.config = a || {};
        Ext.apply( this, a );
        MB.SchoolEditor.superclass.constructor.call( this, a );
        this.setupHandlers();
        this.class_editor = new MB.ClassEditor()
    },
    setupHandlers: function () {
        Ext.select( "#add-class" ).on( "click", function ( a ) {
            a.stopEvent();
            this.addNewClass()
        }, this )
    },
    addNewClass: function () { this.class_editor.addNewClass() }
} );
Ext.onReady( function () {
    Date.useStrict = true;
    var b = Ext.select( "#school-user-details table" ).first();
    if ( b ) {
        var a = new Ext.ux.grid.TableGrid( b, { stripeRows: true, fields: [ { type: "string" }, { type: "string" }, { type: "string" }, { type: "date", dateFormat: "M d, y" }, { type: "string" }, { type: "date", dateFormat: "M d" }, { type: "int" }, { type: "int" } ], columns: [ { sortable: true }, { sortable: true }, { sortable: true }, { sortable: true, renderer: Ext.util.Format.dateRenderer( "M d, y" ) }, { sortable: true }, { sortable: true, renderer: Ext.util.Format.dateRenderer( "M d" ) }, { sortable: true }, { sortable: true } ] } );
        a.render()
    }
} );
MB.applyCouponCode = function ( a, c, b, d ) {
    MB.spinnerOn( a );
    Ext.Ajax.request( {
        url: b,
        params: { code: c, plan: d },
        success: function ( e, h ) {
            var j = Ext.decode( e.responseText );
            var g = Ext.select( ".payment-summary" ).last();
            var f = a.select( "p" ).last();
            if ( j.data.discounted == true ) {
                f.addClass( "success" );
                f.removeClass( "error" );
                f.dom.innerHTML = "Discount applied."
            } else {
                f.removeClass( "success" );
                f.addClass( "error" );
                f.dom.innerHTML = "Discount code is invalid."
            }
            Ext.get( "tr-data" ).dom.innerHTML = j.data.tr_data;
            g.dom.innerHTML = j.data.price_summary;
            g.highlight()
        },
        failure: MB.AjaxGenericFailureMsg,
        scope: this
    } )
};
Ext.onReady( function () {
    if ( !Ext.get( "subscriptions" ) ) { return }
    var a = Ext.get( "coupon-field" );
    if ( a ) {
        var b = a.select( "a" ).last();
        b.on( "click", function ( g ) {
            g.preventDefault();
            var d = a.select( "input" ).first().dom.value;
            var c = b.getAttribute( "url" );
            var f = b.getAttribute( "plan" );
            MB.applyCouponCode( a, d, c, f )
        } )
    }
} );
MB.makeClassQuiz = function ( c, d ) {
    var b = c.parent( "form" );
    MB.spinnerOn( b.parent() );
    var a = c.getAttribute( "data-make-quiz-url" );
    params = { force_quiz: d };
    b.select( "input[type=hidden]" ).each( function ( e ) { params[ e.dom.name ] = e.dom.value } );
    Ext.Ajax.request( {
        url: a,
        failure: MB.AjaxGenericFailureMsg,
        method: "POST",
        params: params,
        timeout: 30 * 1000,
        success: function ( f ) {
            var h = c.parent( ".content" );
            var g = h.child( ".status" );
            var e = h.child( "#last-few-assessments" );
            c.dom.value = "Give a Class Quiz";
            var k = Ext.decode( f.responseText );
            g.dom.innerHTML = k.status_msg;
            if ( k.link ) {
                var m = e.child( "ul" );
                var j = "<li>" + k.link + "</li>";
                var l;
                if ( m ) { l = m.insertHtml( "afterBegin", j, true ) } else {
                    e.dom.innerHTML = "<ul>" + j + "</ul>";
                    l = e.child( "li" )
                }
                l.highlight();
                l.addClass( "new-assessment" )
            }
            g.enableDisplayMode().show()
        }
    } )
};
MB.showClassReadiness = function () {
    var h = Ext.get( "quiz-num-questions" );
    var e = Ext.get( "assessment-readiness" );
    if ( h && e ) {
        var g = Ext.get( "pop-quiz-btn__num" );
        var f = Ext.get( "pop-quiz-btn" );
        var c = Ext.select( "#assessment-readiness .ready-percentage" ).first();
        if ( c.dom.innerHTML == "0%" ) { f.dom.disabled = true }
        var d = Ext.util.JSON.decode( e.dom.getAttribute( "data-readiness" ) );
        var a = Ext.util.JSON.decode( e.dom.getAttribute( "data-all-students" ) );
        var b = a.length;
        h.on( "change", function ( m ) {
            var k = h.dom.value;
            g.dom.value = k;
            var j = d[ k ];
            var n = a.diff( j );
            var l = Math.floor( j.length * 100 / a.length );
            c.dom.innerHTML = l + "%";
            c.highlight();
            if ( l == 0 && !MB.forceQuizChecked() ) { f.dom.disabled = true } else { f.dom.disabled = false }
            if ( l < 50 ) { c.addClass( "bad" ) } else { c.removeClass( "bad" ) } readyStudentsEl = Ext.select( "#assessment-readiness .students-ready em" ).first();
            readyStudentsEl.dom.innerHTML = j.join( ", " );
            readyStudentsEl.highlight();
            notReadyStudentsEl = Ext.select( "#assessment-readiness .students-not-ready em" ).first();
            notReadyStudentsEl.dom.innerHTML = n.join( ", " );
            notReadyStudentsEl.highlight();
            if ( n.length > 0 ) { Ext.get( "force-assessment" ).removeClass( "hidden" ) } else { Ext.get( "force-assessment" ).addClass( "hidden" ) }
        } )
    }
};
MB.activityChart = function () {
    if ( Ext.get( "level-chart" ) ) {
        var h = new google.visualization.DataTable();
        h.addColumn( "string", "Levels" );
        h.addColumn( "number", "Students" );
        var a = Ext.util.JSON.decode( Ext.get( "level-chart-data" ).dom.innerHTML );
        h.addRows( a );
        var k = { width: 320, title: "Students in Level", chartArea: { left: 30, top: 10, bottom: 10 }, pieSliceText: "value", pieSliceTextStyle: { color: "black" }, colors: [ "#CDC4F1", "#BAEDED", "#9EB2DD", "#E3EBFE", "#AD9FDE" ], height: 150 };
        var e = new google.visualization.PieChart( document.getElementById( "level-chart" ) );
        e.draw( h, k )
    }
    if ( Ext.get( "month-chart" ) ) {
        var j = new google.visualization.DataTable();
        j.addColumn( "string", "Date" );
        j.addColumn( "number", "Minutes" );
        var g = Ext.util.JSON.decode( Ext.get( "month-chart-data" ).dom.innerHTML );
        j.addRows( g );
        var d = new google.visualization.AreaChart( document.getElementById( "month-chart" ) );
        d.draw( j, { width: 550, height: 240, chartArea: { left: 50, top: 50, width: "95%" }, hAxis: { slantedText: true, textPosition: "out", textStyle: { fontSize: 9, color: "#3366cc" } }, legend: "top", title: "Average student study time" } )
    }
    if ( Ext.get( "report-chart" ) ) {
        var b = new google.visualization.DataTable();
        b.addColumn( "string", "Student" );
        b.addColumn( "number", "New words" );
        b.addColumn( "number", "Incorrect/Restudied" );
        b.addColumn( "number", "Correctly Answered" );
        var f = Ext.util.JSON.decode( Ext.get( "report-chart-data" ).dom.innerHTML );
        b.addRows( f );
        var c = new google.visualization.BarChart( document.getElementById( "report-chart" ) );
        c.draw( b, { width: 490, height: f.length * 40, chartArea: { top: 20, left: 75, width: "98%", bottom: 0, height: "90%" }, legend: "bottom", isStacked: "true", title: "Word study for this period", fontName: "Georgia", colors: [ "#C2B93E", "#FFAA00", "#808F5D" ], hAxis: { textPosition: "in", gridlineColor: "#DDDDDD" }, vAxis: { textStyle: { fontSize: 10 } } } )
    }
};
MB.changeStudentPassword = function ( a, b ) {
    Ext.Ajax.request( {
        url: a,
        failure: MB.AjaxGenericFailureMsg,
        success: function ( c ) {
            var e = Ext.decode( c.responseText );
            var d = e.error;
            var f = e.msg;
            Ext.Msg.show( { msg: f, title: "Password Reset", icon: d ? Ext.MessageBox.ERROR : Ext.MessageBox.INFO, animEl: b, width: 350 } )
        }
    } )
};
MB.teacherResetPassword = function () {
    Ext.getBody().on( "click", function ( g, d ) {
        g.stopEvent();
        var f = Ext.get( d );
        MB.spinnerOn( f.parent() );
        var c = f.dom.getAttribute( "data-email" );
        var a = "Are you sure you want to reset password?";
        if ( c ) { a += " Students who have school provided emails can reset their own passwords." }
        var b = f.dom.getAttribute( "data-password-url" );
        Ext.Msg.confirm( "Password Reset Confirmation", a, function ( e ) { if ( e === "yes" ) { MB.changeStudentPassword( b, f ) } }, this )
    }, this, { delegate: "#teacher-password-reset-btn" } )
};
MB.activateTeacherStudentSettings = function () {
    Ext.getBody().on( "click", function ( b ) {
        b.stopEvent();
        var a = b.getTarget();
        win = new Ext.Window( { forceFit: true, modal: true, plain: true, height: 500, width: 550, frame: false, border: false, autoScroll: true, bodyCfg: { tag: "iframe", src: a.href }, listeners: { show: function () { Ext.select( ".ext-el-mask" ).addListener( "click", function () { win.close() } ) } } } ).show()
    }, this, { delegate: ".change-settings" } )
};
MB.forceQuizChecked = function () { var a = false; var b = Ext.get( "force_quiz" ); if ( b ) { a = b.dom.checked } return a };
Ext.onReady( function () {
    if ( !Ext.get( "tclasses" ) ) { return } google.load( "visualization", "1.0", { packages: [ "corechart" ], callback: MB.activityChart } );
    var d = Ext.get( "pop-quiz-btn" );
    if ( d ) {
        MB.showClassReadiness();
        d.on( "click", function ( f ) {
            f.stopEvent();
            MB.makeClassQuiz( d, MB.forceQuizChecked() )
        } )
    }
    var a = Ext.get( "force_quiz" );
    if ( a ) { a.on( "click", function ( f ) { if ( a.dom.checked ) { if ( d ) { d.dom.disabled = false } } } ) } MB.teacherResetPassword();
    var c = Ext.select( "#class-overview table" ).first();
    if ( c ) {
        var b = new Ext.ux.grid.TableGrid( c, { stripeRows: true, fields: [ { type: "string" }, { type: "string" }, { type: "int" }, { type: "string" }, { type: "string" }, { type: "string" }, { type: "string" }, { type: "string" }, { type: "string" } ] } );
        b.render()
    }
    MB.activateTeacherStudentSettings()
} );
Ext.onReady( function () {
    if ( !Ext.get( "training_histories" ) ) { return }
    var n = "#training-history-byyear";
    var j = "Blues";
    var B = $.parseJSON( $( n + " span.data" ).html() );
    var v = d3.time.format( "%w" ),
        o = d3.time.format( "%U" ),
        k = d3.time.format( "%Y" ),
        A = d3.time.format( "%b" ),
        x = d3.time.format( "%Y-%m-%d" );
    var u = parseInt( k( x.parse( d3.min( d3.keys( B ) ) ) ), 10 );
    var b = parseInt( k( x.parse( d3.max( d3.keys( B ) ) ) ), 10 ) + 1;
    var r = d3.scale.quantile().domain( [ 0, 60 ] ).range( d3.range( 5 ) );
    var f = 16;
    var g = f * 54 + 20 + 50;
    var y = f * 7 + 45;
    d3.select( "body" ).attr( "class", j );
    var m = d3.select( n ).selectAll( "svg" ).data( d3.range( u, b ) ).enter().append( "svg" ).attr( "width", g ).attr( "height", y );
    var d = m.selectAll( "rect.day" ).data( function ( h ) { return d3.time.days( new Date( h, 0, 1 ), new Date( h + 1, 0, 1 ) ) } ).enter().append( "rect" ).attr( "class", "day" ).attr( "width", f ).attr( "height", f ).attr( "x", function ( h ) { return o( h ) * f } ).attr( "y", function ( h ) { return v( h ) * f } ).map( x ).on( "click", function ( w, h ) { l( w ) } );
    m.append( "text" ).attr( "transform", "translate(-6," + f * 3.5 + ")rotate(-90)" ).attr( "text-anchor", "middle" ).text( String );
    d.filter( function ( h ) { return h in B } ).attr( "class", function ( h ) { return "day q" + r( B[ h ] ) + "-5" } ).append( "title" ).text( function ( h ) { return h + " : " + B[ h ] + " minutes" } );
    m.selectAll( "path.month" ).data( function ( h ) { return d3.time.months( new Date( h, 0, 1 ), new Date( h + 1, 0, 1 ) ) } ).enter().append( "path" ).attr( "class", "month" ).attr( "d", a );

    function a ( D ) {
        var z = new Date( D.getFullYear(), D.getMonth() + 1, 0 ),
            E = +v( D ),
            w = +o( D ),
            C = +v( z ),
            h = +o( z );
        return "M" + ( w + 1 ) * f + "," + E * f + "H" + w * f + "V" + 7 * f + "H" + h * f + "V" + ( C + 1 ) * f + "H" + ( h + 1 ) * f + "V" + 0 + "H" + ( w + 1 ) * f + "Z"
    }
    var e = d3.select( "svg" ).append( "g" ).attr( "class", "month-labels" );
    e.selectAll( "text.month-names" ).data( function ( h ) { return d3.time.months( new Date( h, 0, 1 ), new Date( h + 1, 0, 1 ) ) } ).enter().append( "text" ).attr( "class", "month-name" ).attr( "x", function ( h ) { return o( h ) * f } ).attr( "y", 0 ).text( A );
    var c = d3.select( "svg" ).append( "g" ).attr( "class", "weekday-labels" ).attr( "transform", "translate(" + ( f * 54 ) + "," + ( f ) + ")" );
    c.selectAll( "text.weekday-name" ).data( [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ] ).enter().append( "text" ).attr( "class", "weekday-name" ).attr( "y", function ( w, h ) { return h * f } ).text( String );

    function l ( z ) {
        var I = "#training-history-bydate";
        var F = Ext.get( "username" ).dom.innerHTML;
        var L = 20;
        var E = 20;
        var H = 20;
        var J = 4;
        var N = J * 60 / H * E;
        var C = 10;
        var D = [ 20, 60, 120, 240, 360, 480, 600, 720 ];
        var G = [ 50, 100, 150, 200, 230, 255, 275, 300 ];
        var h = d3.scale.linear().domain( D ).range( G );

        function M ( P ) { var O = "word"; if ( P.restudy ) { O = "restudy" } if ( P.type == "Question" ) { O = P.answer ? "question correct" : "question wrong" } return O }

        function w ( Q ) {
            var O = "#training-history-bydate";
            var S = Ext.get( "username" ).dom.innerHTML;
            var P = "/training_histories/" + S + "/activity?date=" + Q;
            var R = null;
            Ext.Ajax.request( {
                url: P,
                failure: MB.AjaxGenericFailureMsg,
                timeout: 10 * 1000,
                success: function ( T ) {
                    var U = Ext.decode( T.responseText );
                    R = U.data;
                    K( R )
                }
            } )
        }

        function K ( R ) {
            var S = d3.select( I ).selectAll( "div.session-activity" ).data( R, function ( T ) { return T.start } );
            S.enter().append( "div" ).attr( "class", "session-activity" ).append( "h3" ).text( function ( T ) { return T.start } );
            S.exit().remove();
            var P = S.append( "svg" ).attr( "width", function ( T ) { return L * T.history.length + C * 2 } ).attr( "height", N ).append( "g" ).attr( "transform", "translate(" + C + ",0)" );
            items = P.selectAll( ".whi" ).data( function ( U, T ) { return U.history } );
            items.enter().append( "line" ).attr( "x1", function ( U, T ) { return T * L } ).attr( "x2", function ( U, T ) { return T * L } ).attr( "y1", N ).attr( "y2", function ( U, T ) { return N - h( U.time ) } ).style( "stroke", "rgb(0,0,0)" );
            items.append( "title" ).text( function ( T ) { return T.time + " seconds" } );
            items.enter().append( "circle" ).attr( "cx", function ( U, T ) { return T * L } ).attr( "cy", function ( U, T ) { return N - h( U.time ) } ).attr( "r", 8 ).attr( "class", function ( U, T ) { return M( U ) } );
            items.enter().append( "text" ).attr( "x", function ( U, T ) { return T * L } ).attr( "y", function ( U, T ) { return N - h( U.time ) + 3 } ).attr( "text-anchor", "middle" ).text( "c" );
            var Q = d3.scale.linear().domain( D ).range( G.map( function ( T ) { return N - T } ) );
            var O = d3.svg.axis().scale( Q ).orient( "left" );
            P.append( "g" ).attr( "class", "axis" ).attr( "transform", "translate(50,-100)" ).call( O );
            Ext.getBody().on( "click", function ( W, V ) {
                var U = false;
                var X = false;
                var T = false;
                items = d3.select( V ).select( "svg" ).selectAll( "rect.whi" );
                Ext.get( V ).select( "input" ).each( function ( Y ) { if ( Y.dom.checked && Y.dom.value == "question" ) { U = true } if ( Y.dom.checked && Y.dom.value == "restudy" ) { X = true } if ( Y.dom.checked && Y.dom.value == "new_word" ) { T = true } } );
                items.filter( function ( Y ) { return true } ).attr( "opacity", 1 );
                items.filter( function ( Y ) { return !( ( Y.type == "Question" && U ) || ( Y.restudy && X ) || ( Y.type == "Word" && !Y.restudy && T ) ) } ).attr( "opacity", 0.2 )
            }, this, { delegate: ".session-activity" } )
        }
        w( z )
    }
} );
MB.Button = function ( c ) {
    c.cls += " bubbling-btn";
    var d = c.text.replace( /\s+/g, "" ).toLowerCase();
    if ( c.iconOnly ) { c.text = "" }
    var a = new Ext.Button( c );
    a.on( "click", function ( f, g ) { g.buttonClicked = d } );
    return a
};
MB.removeButton = function ( b ) { var a = MB.Button( { renderTo: b, icon: "/images/cancel.png", text: "Remove", cls: "small-text-icon-button" } ); return a };
MB.editButton = function ( b ) { var a = MB.Button( { renderTo: b, icon: "/images/note_edit.png", text: "Edit", cls: "small-text-icon-button" } ); return a };
MB.selectMemHookButton = function ( c, b ) { var a = MB.Button( { renderTo: c, icon: "/images/tick.png", text: b || "Use Me", cls: "small-text-icon-button" } ); return a };
Ext.onReady( function () { Ext.select( ".ctip" ).each( function ( b ) { var d = b.child( ".target" ); var a = b.child( ".content" ); var c = b.child( ".title" ).dom.innerHTML || ""; if ( d && a ) { new Ext.ToolTip( { title: c, target: d, anchor: "left", html: null, autoHide: false, closable: true, contentEl: a } ) } } ) } );
window.Constellation = ( function ( a ) {
    var b = {};

    function c ( e ) {
        if ( b[ e ] ) { return b[ e ].exports }
        var d = b[ e ] = { i: e, l: false, exports: {} };
        a[ e ].call( d.exports, d, d.exports, c );
        d.l = true;
        return d.exports
    }
    c.m = a;
    c.c = b;
    c.d = function ( e, f, d ) { if ( !c.o( e, f ) ) { Object.defineProperty( e, f, { enumerable: true, get: d } ) } };
    c.r = function ( d ) { if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) { Object.defineProperty( d, Symbol.toStringTag, { value: "Module" } ) } Object.defineProperty( d, "__esModule", { value: true } ) };
    c.t = function ( f, g ) {
        if ( g & 1 ) { f = c( f ) }
        if ( g & 8 ) { return f }
        if ( ( g & 4 ) && typeof f === "object" && f && f.__esModule ) { return f }
        var e = Object.create( null );
        c.r( e );
        Object.defineProperty( e, "default", { enumerable: true, value: f } );
        if ( g & 2 && typeof f != "string" ) { for ( var d in f ) { c.d( e, d, function ( h ) { return f[ h ] }.bind( null, d ) ) } }
        return e
    };
    c.n = function ( e ) {
        var d = e && e.__esModule ? function f () { return e[ "default" ] } : function g () { return e };
        c.d( d, "a", d );
        return d
    };
    c.o = function ( d, e ) { return Object.prototype.hasOwnProperty.call( d, e ) };
    c.p = "";
    return c( c.s = 0 )
} )( [ ( function ( aH, al, az ) {
    az.r( al );
    az.d( al, "Graph", function () { return aw } );
    az.d( al, "WordMap", function () { return J } );
    az.d( al, "RootNode", function () { return aj } );
    az.d( al, "SynsetNode", function () { return ak } );
    az.d( al, "Link", function () { return c } );
    az.d( al, "LabelNode", function () { return d } );
    az.d( al, "Node", function () { return an } );
    az.d( al, "ToolTip", function () { return aG } );

    function P ( aJ ) { if ( typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ) { aI = function aI ( aK ) { return typeof aK } } else { aI = function aI ( aK ) { return aK && typeof Symbol === "function" && aK.constructor === Symbol && aK !== Symbol.prototype ? "symbol" : typeof aK } } return aI( aJ ) }

    function Q ( aI, aJ ) { if ( !( aI instanceof aJ ) ) { throw new TypeError( "Cannot call a class as a function" ) } }

    function r ( aL, aJ ) {
        for ( var aI = 0; aI < aJ.length; aI++ ) {
            var aK = aJ[ aI ];
            aK.enumerable = aK.enumerable || false;
            aK.configurable = true;
            if ( "value" in aK ) { aK.writable = true } Object.defineProperty( aL, aK.key, aK )
        }
    }

    function T ( aK, aI, aJ ) { if ( aI ) { r( aK.prototype, aI ) } if ( aJ ) { r( aK, aJ ) } return aK }

    function D ( aJ, aI ) { if ( typeof aI !== "function" && aI !== null ) { throw new TypeError( "Super expression must either be null or a function" ) } aJ.prototype = Object.create( aI && aI.prototype, { constructor: { value: aJ, writable: true, configurable: true } } ); if ( aI ) { S( aJ, aI ) } }

    function S ( aJ, aI ) { aK = Object.setPrototypeOf || function aK ( aM, aL ) { aM.__proto__ = aL; return aM }; return aK( aJ, aI ) }

    function V ( aJ ) {
        var aK = am();
        return function aI () {
            var aM = ac( aJ ),
                aL;
            if ( aK ) {
                var aN = ac( this ).constructor;
                aL = Reflect.construct( aM, arguments, aN )
            } else { aL = aM.apply( this, arguments ) }
            return aD( this, aL )
        }
    }

    function aD ( aI, aJ ) { if ( aJ && ( P( aJ ) === "object" || typeof aJ === "function" ) ) { return aJ } return ai( aI ) }

    function ai ( aI ) { if ( aI === void 0 ) { throw new ReferenceError( "this hasn't been initialised - super() hasn't been called" ) } return aI }

    function am () { if ( typeof Reflect === "undefined" || !Reflect.construct ) { return false } if ( Reflect.construct.sham ) { return false } if ( typeof Proxy === "function" ) { return true } try { Date.prototype.toString.call( Reflect.construct( Date, [], function () { } ) ); return true } catch ( aI ) { return false } }

    function ac ( aJ ) { aI = Object.setPrototypeOf ? Object.getPrototypeOf : function aI ( aK ) { return aK.__proto__ || Object.getPrototypeOf( aK ) }; return aI( aJ ) }
    var an = function ( aV ) {
        D( aP, aV );
        var aU = V( aP );

        function aP ( a0, aX, aY ) {
            var aZ;
            Q( this, aP );
            aZ = aU.call( this );
            aZ.initialize();
            aZ.id = a0;
            aZ.type = aX;
            aZ.level = null;
            aZ.incomingLink = null;
            aZ.graph = aY;
            aZ.childNodes = [];
            return aZ
        }
        T( aP, [ { key: "addChildNode", value: function aW ( aX ) { return this.childNodes.push( aX ) } }, { key: "distance_from_center", value: function aI () { return 0 } }, { key: "wedge", value: function aT () { return this.w } }, { key: "startAngle", value: function aO () { return this.a } }, { key: "theta", value: function aJ () { return this.t } }, {
            key: "show",
            value: function aS () {
                this.x = this.computedPosition.x;
                this.y = this.computedPosition.y;
                return this.alpha = 1
            }
        }, {
            key: "setParentNode",
            value: function aN ( aX ) {
                this.parentNode = aX;
                this.level = aX.level + 1;
                return this.parentNode.addChildNode( this )
            }
        }, { key: "siblingNodes", value: function aQ () { var aX = this; return this.parentNode.childNodes.filter( function ( aY ) { return aY.id !== aX.id } ) } }, {
            key: "setSlice",
            value: function aK ( aZ, aY, aX ) {
                this.w = aZ;
                this.a = aY;
                return this.t = aX
            }
        }, {
            key: "collides",
            value: function aL ( aZ ) {
                var aY, aX;
                aY = this.globalBounds();
                aX = aZ.globalBounds();
                return aY.x < aX.x + aX.width && aY.x + aY.width > aX.x && aY.y < aX.y + aX.height && aY.height + aY.y > aX.y
            }
        }, {
            key: "maxBloom",
            value: function aR () {
                var aY, aX;
                aY = Math.max.apply( Math, this.childNodes.map( function ( aZ ) { return aZ.maxBloom() } ) );
                aX = Math.max( this.childNodes.length, 1 );
                return Math.max( aY, aX )
            }
        }, {
            key: "totalBloom",
            value: function aM () {
                var aX;
                aX = this.childNodes.map( function ( aY ) { return aY.maxBloom() } );
                if ( aX.length === 0 ) { return 1 }
                return aX.reduce( function ( aY, aZ ) { return aY + aZ } )
            }
        } ] );
        return aP
    }( createjs.Container );

    function ay ( aJ ) { if ( typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ) { ay = function aI ( aK ) { return typeof aK } } else { ay = function aI ( aK ) { return aK && typeof Symbol === "function" && aK.constructor === Symbol && aK !== Symbol.prototype ? "symbol" : typeof aK } } return ay( aJ ) }

    function aB ( aI, aJ ) { if ( !( aI instanceof aJ ) ) { throw new TypeError( "Cannot call a class as a function" ) } }

    function X ( aL, aJ ) {
        for ( var aI = 0; aI < aJ.length; aI++ ) {
            var aK = aJ[ aI ];
            aK.enumerable = aK.enumerable || false;
            aK.configurable = true;
            if ( "value" in aK ) { aK.writable = true } Object.defineProperty( aL, aK.key, aK )
        }
    }

    function g ( aK, aI, aJ ) { if ( aI ) { X( aK.prototype, aI ) } if ( aJ ) { X( aK, aJ ) } return aK }

    function v ( aJ, aI ) { if ( typeof aI !== "function" && aI !== null ) { throw new TypeError( "Super expression must either be null or a function" ) } aJ.prototype = Object.create( aI && aI.prototype, { constructor: { value: aJ, writable: true, configurable: true } } ); if ( aI ) { ap( aJ, aI ) } }

    function ap ( aJ, aI ) { ap = Object.setPrototypeOf || function aK ( aM, aL ) { aM.__proto__ = aL; return aM }; return ap( aJ, aI ) }

    function m ( aJ ) {
        var aK = n();
        return function aI () {
            var aM = aE( aJ ),
                aL;
            if ( aK ) {
                var aN = aE( this ).constructor;
                aL = Reflect.construct( aM, arguments, aN )
            } else { aL = aM.apply( this, arguments ) }
            return F( this, aL )
        }
    }

    function F ( aI, aJ ) { if ( aJ && ( ay( aJ ) === "object" || typeof aJ === "function" ) ) { return aJ } return e( aI ) }

    function e ( aI ) { if ( aI === void 0 ) { throw new ReferenceError( "this hasn't been initialised - super() hasn't been called" ) } return aI }

    function n () { if ( typeof Reflect === "undefined" || !Reflect.construct ) { return false } if ( Reflect.construct.sham ) { return false } if ( typeof Proxy === "function" ) { return true } try { Date.prototype.toString.call( Reflect.construct( Date, [], function () { } ) ); return true } catch ( aI ) { return false } }

    function aE ( aJ ) { aE = Object.setPrototypeOf ? Object.getPrototypeOf : function aI ( aK ) { return aK.__proto__ || Object.getPrototypeOf( aK ) }; return aE( aJ ) }
    var aj = function ( aI ) {
        v( aJ, aI );
        var aM = m( aJ );

        function aJ ( aP, aQ, aR ) {
            var aS;
            aB( this, aJ );
            aS = aM.call( this );
            if ( aR == null ) { aR = "word" } aS.wf = aP;
            aS.level = 0;
            aS.father = null;
            aS.mode = aR;
            aS._buildRootLabel();
            aS.alpha = 0;
            return aS
        }
        g( aJ, [ { key: "wedge", value: function aL () { return 360 } }, { key: "startAngle", value: function aK () { return 0 } }, {
            key: "updatePosition",
            value: function aN ( aP, aQ ) {
                this.computedPosition = new createjs.Point( aP, aQ );
                aP = -this.label.getMeasuredWidth() / 2;
                aQ = -this.label.getMeasuredHeight() / 2;
                this.label.x = aP;
                return this.label.y = aQ
            }
        }, {
            key: "_buildRootLabel",
            value: function aO () {
                this.label = new createjs.Text( this.wf );
                var aP = new createjs.Shadow( "#000000", 1, 1, 1 );
                this.label.shadow = aP;
                this.label.font = "30px Verdana ";
                this.label.color = "#ddd";
                return this.addChild( this.label )
            }
        } ] );
        return aJ
    }( an );

    function M ( aJ, aK ) { var aL = Object.keys( aJ ); if ( Object.getOwnPropertySymbols ) { var aI = Object.getOwnPropertySymbols( aJ ); if ( aK ) { aI = aI.filter( function ( aM ) { return Object.getOwnPropertyDescriptor( aJ, aM ).enumerable } ) } aL.push.apply( aL, aI ) } return aL }

    function aq ( aK ) { for ( var aI = 1; aI < arguments.length; aI++ ) { var aJ = arguments[ aI ] != null ? arguments[ aI ] : {}; if ( aI % 2 ) { M( Object( aJ ), true ).forEach( function ( aL ) { aa( aK, aL, aJ[ aL ] ) } ) } else { if ( Object.getOwnPropertyDescriptors ) { Object.defineProperties( aK, Object.getOwnPropertyDescriptors( aJ ) ) } else { M( Object( aJ ) ).forEach( function ( aL ) { Object.defineProperty( aK, aL, Object.getOwnPropertyDescriptor( aJ, aL ) ) } ) } } } return aK }

    function aa ( aK, aI, aJ ) { if ( aI in aK ) { Object.defineProperty( aK, aI, { value: aJ, enumerable: true, configurable: true, writable: true } ) } else { aK[ aI ] = aJ } return aK }

    function z ( aI, aJ ) { if ( !( aI instanceof aJ ) ) { throw new TypeError( "Cannot call a class as a function" ) } }

    function x ( aL, aJ ) {
        for ( var aI = 0; aI < aJ.length; aI++ ) {
            var aK = aJ[ aI ];
            aK.enumerable = aK.enumerable || false;
            aK.configurable = true;
            if ( "value" in aK ) { aK.writable = true } Object.defineProperty( aL, aK.key, aK )
        }
    }

    function C ( aK, aI, aJ ) { if ( aI ) { x( aK.prototype, aI ) } if ( aJ ) { x( aK, aJ ) } return aK }
    var aG = function () {
        function aJ ( aO, aR, aP, aQ ) {
            z( this, aJ );
            this.x = aO;
            this.y = aR;
            this.stage = aP;
            this.toolTipText = aQ;
            this.toolTipRectangle
        }
        C( aJ, [ {
            key: "_createToolTipRectangle",
            value: function aM ( aU, aT ) {
                var aP = aT.height,
                    aR = aT.width,
                    aQ = aT.toolTipColor;
                var aS = { height: aP, width: aR };
                if ( aU ) { this.toolTipRectangle = aq( { x: this.x - aR / 2, y: this.y + aP / 2 }, aS ) } else { this.toolTipRectangle = aq( { x: this.x - aR / 2, y: this.y - 105 }, aS ) }
                var aO = new createjs.Graphics().beginFill( aQ ).drawRoundRect( this.toolTipRectangle.x, this.toolTipRectangle.y, aR, aP, 5 );
                return new createjs.Shape( aO )
            }
        }, {
            key: "_createToolTipPoint",
            value: function aK ( aS, aQ, aU ) {
                var aW = aQ.height,
                    aO = aQ.width,
                    aR = aQ.toolTipColor;
                var aT, aV;
                if ( aS ) {
                    aT = 150;
                    aV = { x: aU.x + aO / 2, y: aU.y - 5 }
                } else {
                    aT = 90;
                    aV = { x: aU.x + aO / 2, y: aU.y + aW + 5.5 }
                }
                var aP = new createjs.Graphics().beginFill( aR ).drawPolyStar( aV.x, aV.y, 12, 3, 0, aT );
                return new createjs.Shape( aP )
            }
        }, {
            key: "_createToolTipDefinitionText",
            value: function aL ( aU, aT ) {
                var aW = aT.height,
                    aQ = aT.width,
                    aR = aT.textTopPadding,
                    aO = aT.textSidePadding;
                var aP = new createjs.Text();
                var aS = { lineWidth: aQ - aO, font: "14px BrandonTextRegular", color: "white", text: this.toolTipText };
                var aV;
                if ( aU ) { aV = aq( aq( {}, aS ), {}, { x: this.x - aQ / 2 + aO, y: this.y + aW / 2 + aR } ) } else { aV = aq( aq( {}, aS ), {}, { x: this.x - aQ / 2 + aO, y: this.y - 100 + aR } ) } aP.set( aV );
                return aP
            }
        }, {
            key: "showTooltip",
            value: function aN () {
                var aP = this.y < 125;
                var aO = { height: 75, width: this.stage.fullscreen ? 400 : 225, toolTipColor: "rgba(21, 31, 35, 0.90)", textTopPadding: 5, textSidePadding: 10 };
                this.definitionToolTip = this._createToolTipRectangle( aP, aO );
                this.toolTipPoint = this._createToolTipPoint( aP, aO, this.toolTipRectangle );
                this.definitionText = this._createToolTipDefinitionText( aP, aO );
                this.definitionToolTip.filters = [ new createjs.BlurFilter( 2, 2 ) ];
                this.toolTipPoint.filters = [ new createjs.BlurFilter( 2, 2 ) ];
                this.stage.addChild( this.toolTipPoint, this.definitionToolTip, this.definitionText )
            }
        }, { key: "hideTooltip", value: function aI () { this.stage.removeChild( this.definitionText, this.definitionToolTip, this.toolTipPoint ) } } ] );
        return aJ
    }();

    function aC ( aJ ) { if ( typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ) { aC = function aI ( aK ) { return typeof aK } } else { aC = function aI ( aK ) { return aK && typeof Symbol === "function" && aK.constructor === Symbol && aK !== Symbol.prototype ? "symbol" : typeof aK } } return aC( aJ ) }

    function U ( aI, aJ ) { if ( !( aI instanceof aJ ) ) { throw new TypeError( "Cannot call a class as a function" ) } }

    function R ( aL, aJ ) {
        for ( var aI = 0; aI < aJ.length; aI++ ) {
            var aK = aJ[ aI ];
            aK.enumerable = aK.enumerable || false;
            aK.configurable = true;
            if ( "value" in aK ) { aK.writable = true } Object.defineProperty( aL, aK.key, aK )
        }
    }

    function ao ( aK, aI, aJ ) { if ( aI ) { R( aK.prototype, aI ) } if ( aJ ) { R( aK, aJ ) } return aK }

    function ah ( aJ, aI ) { if ( typeof aI !== "function" && aI !== null ) { throw new TypeError( "Super expression must either be null or a function" ) } aJ.prototype = Object.create( aI && aI.prototype, { constructor: { value: aJ, writable: true, configurable: true } } ); if ( aI ) { O( aJ, aI ) } }

    function O ( aJ, aI ) { O = Object.setPrototypeOf || function aK ( aM, aL ) { aM.__proto__ = aL; return aM }; return O( aJ, aI ) }

    function au ( aJ ) {
        var aK = Y();
        return function aI () {
            var aM = W( aJ ),
                aL;
            if ( aK ) {
                var aN = W( this ).constructor;
                aL = Reflect.construct( aM, arguments, aN )
            } else { aL = aM.apply( this, arguments ) }
            return N( this, aL )
        }
    }

    function N ( aI, aJ ) { if ( aJ && ( aC( aJ ) === "object" || typeof aJ === "function" ) ) { return aJ } return A( aI ) }

    function A ( aI ) { if ( aI === void 0 ) { throw new ReferenceError( "this hasn't been initialised - super() hasn't been called" ) } return aI }

    function Y () { if ( typeof Reflect === "undefined" || !Reflect.construct ) { return false } if ( Reflect.construct.sham ) { return false } if ( typeof Proxy === "function" ) { return true } try { Date.prototype.toString.call( Reflect.construct( Date, [], function () { } ) ); return true } catch ( aI ) { return false } }

    function W ( aJ ) { W = Object.setPrototypeOf ? Object.getPrototypeOf : function aI ( aK ) { return aK.__proto__ || Object.getPrototypeOf( aK ) }; return W( aJ ) }
    var ak = function ( aL ) {
        ah( aN, aL );
        var aV = au( aN );

        function aN ( a4, aZ, a1, a0, aX, aY, aW ) {
            var a3;
            U( this, aN );
            a3 = aV.call( this, a4, aY, a0 );
            a3.l = aW;
            a3.defn = aZ;
            a3.partOfSpeech = a1;
            a3.bubbleRadius = 5;
            a3.color = a3._color();
            a3.graph = a0;
            a3._stage = aX;
            a3._buildBubble();
            a3._setupHandlers();
            return a3
        }
        ao( aN, [ { key: "distance_from_center", value: function aI () { return this.graph.ringRadius[ this.level ] } }, { key: "setupAnimation", value: function aK () { return this.tween = createjs.Tween.get( this, { paused: true } ).to( { x: this.computedPosition.x, y: this.computedPosition.y, alpha: 1 }, this.graph.ANIMATION_DURATION ) } }, {
            key: "show",
            value: function aT () {
                var aW = this;
                this.tween.setPaused( false );
                return this.tween.addEventListener( "change", function () { return aW.incomingLink.show() } )
            }
        }, {
            key: "_setupHandlers",
            value: function aS () {
                this.b.cursor = "pointer";
                this._handleRollout = this._handleRollout.bind( this );
                this._handleRollover = this._handleRollover.bind( this );
                this.b.addEventListener( "rollover", this._handleRollover );
                return this.b.addEventListener( "rollout", this._handleRollout )
            }
        }, {
            key: "updatePosition",
            value: function aP ( aW, aX ) {
                this.computedPosition = new createjs.Point( aW, aX );
                this.ssNodetooltip = new aG( aW, aX, this._stage, this._buildTextForLabel( this.defn ) )
            }
        }, {
            key: "_buildBubble",
            value: function aQ () {
                var aW;
                this.b = new createjs.Shape();
                this._drawBubble( 1, this.bubbleRadius );
                aW = new createjs.Shadow( "#000000", 1, 1, 1 );
                this.b.shadow = aW;
                return this.addChild( this.b )
            }
        }, {
            key: "_drawBubble",
            value: function aO ( aX, aW ) {
                this.b.graphics.clear();
                this.b.graphics.setStrokeStyle( aX );
                this.b.graphics.beginStroke( "#000000" );
                return this.b.graphics.beginFill( this.color ).drawCircle( 0, 0, aW )
            }
        }, {
            key: "_color",
            value: function aM () {
                switch ( this.partOfSpeech ) {
                    case "n":
                        return "#FF7F00";
                    case "v":
                        return "#99DD45";
                    case "a":
                        return "#CCCC33";
                    case "r":
                        return "#CC12F6";
                    default:
                        return "white"
                }
            }
        }, {
            key: "_handleRollover",
            value: function aU () {
                this._drawBubble( 2, this.bubbleRadius + 3 );
                this.ssNodetooltip.showTooltip()
            }
        }, {
            key: "_handleRollout",
            value: function aR () {
                this.ssNodetooltip.hideTooltip();
                this._drawBubble( 1, this.bubbleRadius )
            }
        }, {
            key: "_buildTextForLabel",
            value: function aJ ( aW ) {
                switch ( this.partOfSpeech ) {
                    case "n":
                        return "noun: ".concat( aW );
                    case "v":
                        return "verb: ".concat( aW );
                    case "a":
                        return "adj: ".concat( aW );
                    case "r":
                        return "adverb: ".concat( aW );
                    default:
                        return aW
                }
            }
        } ] );
        return aN
    }( an );

    function k ( aJ ) { if ( typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ) { k = function aI ( aK ) { return typeof aK } } else { k = function aI ( aK ) { return aK && typeof Symbol === "function" && aK.constructor === Symbol && aK !== Symbol.prototype ? "symbol" : typeof aK } } return k( aJ ) }

    function at ( aI, aJ ) { if ( !( aI instanceof aJ ) ) { throw new TypeError( "Cannot call a class as a function" ) } }

    function I ( aL, aJ ) {
        for ( var aI = 0; aI < aJ.length; aI++ ) {
            var aK = aJ[ aI ];
            aK.enumerable = aK.enumerable || false;
            aK.configurable = true;
            if ( "value" in aK ) { aK.writable = true } Object.defineProperty( aL, aK.key, aK )
        }
    }

    function h ( aK, aI, aJ ) { if ( aI ) { I( aK.prototype, aI ) } if ( aJ ) { I( aK, aJ ) } return aK }

    function o ( aJ, aI ) { if ( typeof aI !== "function" && aI !== null ) { throw new TypeError( "Super expression must either be null or a function" ) } aJ.prototype = Object.create( aI && aI.prototype, { constructor: { value: aJ, writable: true, configurable: true } } ); if ( aI ) { ad( aJ, aI ) } }

    function ad ( aJ, aI ) { ad = Object.setPrototypeOf || function aK ( aM, aL ) { aM.__proto__ = aL; return aM }; return ad( aJ, aI ) }

    function l ( aJ ) {
        var aK = b();
        return function aI () {
            var aM = av( aJ ),
                aL;
            if ( aK ) {
                var aN = av( this ).constructor;
                aL = Reflect.construct( aM, arguments, aN )
            } else { aL = aM.apply( this, arguments ) }
            return u( this, aL )
        }
    }

    function u ( aI, aJ ) { if ( aJ && ( k( aJ ) === "object" || typeof aJ === "function" ) ) { return aJ } return j( aI ) }

    function j ( aI ) { if ( aI === void 0 ) { throw new ReferenceError( "this hasn't been initialised - super() hasn't been called" ) } return aI }

    function b () { if ( typeof Reflect === "undefined" || !Reflect.construct ) { return false } if ( Reflect.construct.sham ) { return false } if ( typeof Proxy === "function" ) { return true } try { Date.prototype.toString.call( Reflect.construct( Date, [], function () { } ) ); return true } catch ( aI ) { return false } }

    function av ( aJ ) { av = Object.setPrototypeOf ? Object.getPrototypeOf : function aI ( aK ) { return aK.__proto__ || Object.getPrototypeOf( aK ) }; return av( aJ ) }
    var H = { "0": { code: "hypernym", description: "kind of", direction: "up" }, "1": { code: "antonym", description: "opposite of", direction: "none" }, "2": { code: "entailment", description: "if true then also true", direction: "up" }, "3": { code: "cause", description: "causes", direction: "none" }, "4": { code: "similar_to", description: "similar to", direction: "none" }, "5": { code: "pertainym", description: "of or pertaining to", direction: "up" }, "6": { code: "attribute", description: "attribute of", direction: "down" }, "7": { code: "see_also", description: "see also", direction: "none" }, "8": { code: "holonym", description: "part of", direction: "up" } };
    var c = function ( aR ) {
        o( aI, aR );
        var aQ = l( aI );

        function aI ( aW, aU, aV, aT ) {
            var aX;
            at( this, aI );
            aX = aQ.call( this );
            aX.n1 = aW;
            aX.n2 = aU;
            aX._stage = aT;
            aX.hoverable = aW.type === "ss" && aU.type === "ss";
            aX.isAntonym = aV;
            aX.initialize();
            aX.n2.setParentNode( aX.n1 );
            aX.line = new createjs.Shape();
            aX.addChild( aX.line );
            aX.n2.incomingLink = j( aX );
            if ( aX.hoverable ) { aX._setupHandler() }
            return aX
        }
        h( aI, [ { key: "show", value: function aO () { var aU = new createjs.Point( this.n1.x, this.n1.y ); var aT = new createjs.Point( this.n2.x, this.n2.y ); if ( this.hoverable ) { this._createTooltip() } return this._draw( aU, aT ) } }, { key: "_getTooltipCoordinates", value: function aS ( aV, aU ) { var aT = ( aV.x + aU.x ) / 2; var aW = ( aV.y + aU.y ) / 2; return { x: aT, y: aW } } }, { key: "_getTooltipMessage", value: function aJ () { var aT = H[ this.n2.l ]; return "".concat( aT.code, ": " ).concat( aT.description ) } }, {
            key: "_createTooltip",
            value: function aL () {
                var aV = this._getTooltipCoordinates( this.n1, this.n2 ),
                    aT = aV.x,
                    aW = aV.y;
                var aU = this._getTooltipMessage();
                this.linkToolTip = new aG( aT, aW, this._stage, aU );
                return this.linkToolTip
            }
        }, {
            key: "_draw",
            value: function aM ( aU, aT ) {
                this.line.graphics.clear();
                this.hoverable && this.line.graphics.setStrokeDash( [ 7, 3 ], 0 );
                this.line.graphics.beginStroke( this.isAntonym ? "rgba(164,36,41,0.3)" : "rgba(255,255,255,0.75)" );
                this.hoverable && this.line.graphics.setStrokeStyle( 3 );
                this.line.graphics.moveTo( aU.x, aU.y );
                this.line.graphics.lineTo( aT.x, aT.y );
                return this.line.graphics.endStroke()
            }
        }, {
            key: "_setupHandler",
            value: function aK () {
                this.line.cursor = "hand";
                this._handleRollout = this._handleRollout.bind( this );
                this._handleRollover = this._handleRollover.bind( this );
                this.line.addEventListener( "rollover", this._handleRollover );
                this.line.addEventListener( "rollout", this._handleRollout )
            }
        }, {
            key: "_handleRollover",
            value: function aP () {
                this.line.graphics.clear();
                this.line.graphics.setStrokeDash( [ 7, 3 ], 0 );
                this.line.graphics.setStrokeStyle( 6 );
                this.line.graphics.beginStroke( this.isAntonym ? "rgba(198,4,8,0.75)" : "rgba(255,255,255,0.75)" );
                this.line.graphics.moveTo( this.n1.x, this.n1.y );
                this.line.graphics.lineTo( this.n2.x, this.n2.y );
                this.linkToolTip.showTooltip();
                return this.line.graphics.endStroke()
            }
        }, {
            key: "_handleRollout",
            value: function aN () {
                this.line.graphics.clear();
                this.linkToolTip.hideTooltip();
                return this.show()
            }
        } ] );
        return aI
    }( createjs.Container );

    function L ( aJ ) { if ( typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ) { L = function aI ( aK ) { return typeof aK } } else { L = function aI ( aK ) { return aK && typeof Symbol === "function" && aK.constructor === Symbol && aK !== Symbol.prototype ? "symbol" : typeof aK } } return L( aJ ) }

    function a ( aI, aJ ) { if ( !( aI instanceof aJ ) ) { throw new TypeError( "Cannot call a class as a function" ) } }

    function ar ( aL, aJ ) {
        for ( var aI = 0; aI < aJ.length; aI++ ) {
            var aK = aJ[ aI ];
            aK.enumerable = aK.enumerable || false;
            aK.configurable = true;
            if ( "value" in aK ) { aK.writable = true } Object.defineProperty( aL, aK.key, aK )
        }
    }

    function Z ( aK, aI, aJ ) { if ( aI ) { ar( aK.prototype, aI ) } if ( aJ ) { ar( aK, aJ ) } return aK }

    function ag ( aJ, aI ) { if ( typeof aI !== "function" && aI !== null ) { throw new TypeError( "Super expression must either be null or a function" ) } aJ.prototype = Object.create( aI && aI.prototype, { constructor: { value: aJ, writable: true, configurable: true } } ); if ( aI ) { aF( aJ, aI ) } }

    function aF ( aJ, aI ) { aF = Object.setPrototypeOf || function aK ( aM, aL ) { aM.__proto__ = aL; return aM }; return aF( aJ, aI ) }

    function ae ( aJ ) {
        var aK = ab();
        return function aI () {
            var aM = f( aJ ),
                aL;
            if ( aK ) {
                var aN = f( this ).constructor;
                aL = Reflect.construct( aM, arguments, aN )
            } else { aL = aM.apply( this, arguments ) }
            return af( this, aL )
        }
    }

    function af ( aI, aJ ) { if ( aJ && ( L( aJ ) === "object" || typeof aJ === "function" ) ) { return aJ } return aA( aI ) }

    function aA ( aI ) { if ( aI === void 0 ) { throw new ReferenceError( "this hasn't been initialised - super() hasn't been called" ) } return aI }

    function ab () { if ( typeof Reflect === "undefined" || !Reflect.construct ) { return false } if ( Reflect.construct.sham ) { return false } if ( typeof Proxy === "function" ) { return true } try { Date.prototype.toString.call( Reflect.construct( Date, [], function () { } ) ); return true } catch ( aI ) { return false } }

    function f ( aJ ) { f = Object.setPrototypeOf ? Object.getPrototypeOf : function aI ( aK ) { return aK.__proto__ || Object.getPrototypeOf( aK ) }; return f( aJ ) }
    var d = function ( aP ) {
        ag( aR, aP );
        var aX = ae( aR );

        function aR ( a6, a3, a4, a0, a1 ) {
            var a5;
            a( this, aR );
            a5 = aX.call( this, a6, a1, a3 );
            a5.mode = a4 != null ? a4 : "word";
            a5.color = a5._color();
            a5.graph = a3;
            a5.id = a6;
            a5.wordmap = a0;
            a5.jitter = 0;
            a5._buildLabelNode();
            a5._setupHandler();
            return a5
        }
        Z( aR, [ { key: "updatePosition", value: function aI ( a0, a1 ) { return this.computedPosition = new createjs.Point( a0, a1 ) } }, {
            key: "setupAnimation",
            value: function aS () {
                this.label.font = this._fntSize() + "px Verdana ";
                this._centerLabelAroundPosition();
                return this.tween = createjs.Tween.get( this, { paused: true } ).to( { x: this.computedPosition.x, y: this.computedPosition.y, alpha: 1 }, this.graph.ANIMATION_DURATION )
            }
        }, {
            key: "show",
            value: function aZ () {
                var a0 = this;
                this.tween.setPaused( false );
                return this.tween.addEventListener( "change", function () { return a0.incomingLink.show() } )
            }
        }, {
            key: "distance_from_center",
            value: function aO () {
                var a0;
                a0 = 25;
                return this.graph.ringRadius.map( function ( a1 ) { return Math.max( 0, a1 - a0 ) } )[ this.level ]
            }
        }, { key: "accumulateJitter", value: function aW ( a0 ) { return this.jitter += a0 } }, {
            key: "globalBounds",
            value: function aT () {
                var a3 = arguments.length > 0 && arguments[ 0 ] !== undefined ? arguments[ 0 ] : false;
                var a1, a4, a6, a5, a0, a7;
                a6 = this.label.getBounds();
                a5 = a6.width * 1.3;
                a0 = this.computedPosition.x - a5 / 2;
                a7 = this.computedPosition.y - this.label.y;
                a4 = { x: a0, y: a7, width: a5, height: a6.height };
                if ( a3 ) {
                    a1 = new createjs.Shape();
                    a1.graphics.beginFill( "#000" ).drawRect( a0, a7, a5, a6.height );
                    this.graph.container.addChild( a1 )
                }
                return a4
            }
        }, {
            key: "_centerLabelAroundPosition",
            value: function aY () {
                var a0;
                a0 = this.label.getBounds();
                if ( this.computedPosition.y < this.graph.centerPoint.y ) {
                    this.label.y = -1.5 * this.label.getMeasuredHeight();
                    this.label.y = -1.5 * a0.height
                }
                return this.label.x = -a0.width / 2
            }
        }, { key: "_color", value: function aL () { return "#ccc" } }, {
            key: "_setupHandler",
            value: function aN () {
                if ( this.mode === "word" ) {
                    this.container.cursor = "pointer";
                    this._handleRollout = this._handleRollout.bind( this );
                    this._handleRollover = this._handleRollover.bind( this );
                    this._handleClick = this._handleClick.bind( this );
                    this.container.addEventListener( "rollover", this._handleRollover );
                    this.container.addEventListener( "rollout", this._handleRollout );
                    this.container.addEventListener( "click", this._handleClick )
                }
            }
        }, {
            key: "_buildLabelNode",
            value: function aK () {
                var a0, a1, a3;
                this.container = new createjs.Container();
                this.addChild( this.container );
                this.label = new createjs.Text( this.id );
                a3 = new createjs.Shadow( "#000000", 1, 1, 1 );
                this.label.shadow = a3;
                this.label.color = this.color;
                this.container.addChild( this.label );
                this.label.baseline = "middle";
                a0 = new createjs.Shape();
                a0.graphics.beginFill( this.color ).drawCircle( 0, 0, 2 );
                this.container.addChild( a0 );
                a1 = new createjs.Shape();
                a1.graphics.beginFill( "#000" ).drawRect( 0, 0, this.label.getMeasuredWidth() + 5, this.label.getMeasuredHeight() + 5 );
                this.label.hitArea = a1
            }
        }, { key: "_fntSize", value: function aU () { return [ 0, 17, 12, 10 ][ this.level ] } }, { key: "_handleRollover", value: function aM () { return this.label.color = "#fff" } }, { key: "_handleRollout", value: function aQ () { return this.label.color = this.color } }, { key: "_checkIfWordformIsInHistoryAndUpdateHistory", value: function aV ( a0 ) { var a1 = this.wordmap.history.indexOf( a0 ); if ( a1 > -1 ) { this.wordmap.history.splice( a1, 1 ) } this.wordmap.history.push( a0 ) } }, {
            key: "_handleClick",
            value: function aJ () {
                var a0 = this;
                this.wordmap.nextGraph = new aw( this.id, this.wordmap );
                this.wordmap.nextGraph.fetch().then( function () {
                    a0._checkIfWordformIsInHistoryAndUpdateHistory( a0.id );
                    a0.wordmap.currHistoryIndex = a0.wordmap.history.length - 1;
                    a0.wordmap.currentGraph.removeFromStage();
                    a0.wordmap.nextGraph.addToStage();
                    a0.wordmap.nextGraph.draw();
                    a0.wordmap.currentGraph = a0.wordmap.nextGraph;
                    a0.wordmap.nextGraph = null
                } )
            }
        } ] );
        return aR
    }( an );

    function y ( aI, aJ ) { if ( !( aI instanceof aJ ) ) { throw new TypeError( "Cannot call a class as a function" ) } }

    function ax ( aL, aJ ) {
        for ( var aI = 0; aI < aJ.length; aI++ ) {
            var aK = aJ[ aI ];
            aK.enumerable = aK.enumerable || false;
            aK.configurable = true;
            if ( "value" in aK ) { aK.writable = true } Object.defineProperty( aL, aK.key, aK )
        }
    }

    function E ( aK, aI, aJ ) { if ( aI ) { ax( aK.prototype, aI ) } if ( aJ ) { ax( aK, aJ ) } return aK }
    var aw = function () {
        function aP ( aW, aV ) {
            y( this, aP );
            this.ANIMATION_DURATION = 750;
            this.wf = aW;
            this.data = null;
            this.nodes = [];
            this.links = [];
            this.wordmap = aV;
            this._buildRootNode()
        }
        E( aP, [ {
            key: "addToStage",
            value: function aJ () {
                this.container = new createjs.Container();
                this.wordmap.stage.addChild( this.container );
                this.wordmap.updateHistoryButtons()
            }
        }, { key: "removeFromStage", value: function aO () { this.wordmap.stage.removeChild( this.container ) } }, {
            key: "_buildRootNode",
            value: function aR () {
                this.centerPoint = new createjs.Point( this.wordmap.stage.width / 2, this.wordmap.stage.height / 2 );
                this.rootNode = new aj( this.wf, this, this.mode );
                this.rootNode.updatePosition( this.centerPoint.x, this.centerPoint.y )
            }
        }, {
            key: "fetch",
            value: function ( aW ) {
                function aV () { return aW.apply( this, arguments ) } aV.toString = function () { return aW.toString() };
                return aV
            }( function () { var aV = this; return fetch( "https://cdn1.membean.com/public/data/wnjson2/".concat( this.wf, ".json" ) ).then( function ( aW ) { return aW.json() } ).then( function ( aW ) { aV.data = aW; return aW } ) } )
        }, {
            key: "draw",
            value: function aS () {
                this._parse( this.data.children, this.rootNode );
                this._computeRingRadii();
                this._buildLayout( this.rootNode );
                this._drawRings();
                this._jitter();
                this.show()
            }
        }, {
            key: "_parse",
            value: function aM ( aW, a0 ) {
                var a4, aV, aY, a1, a3, a7, aX, a6, aZ, a5;
                aZ = [];
                for ( aY = 0, a3 = aW.length; aY < a3; aY++ ) {
                    a1 = aW[ aY ];
                    aV = a1.i;
                    a5 = a1.t || "label";
                    a6 = a1.p;
                    a4 = a1.d;
                    if ( a5 === "ss" ) { aX = new ak( aV, a4, a6, this, this.wordmap.stage, a5, a1.l ) } else { aX = new d( aV, this, this.mode, this.wordmap, a5 ) } a7 = a1.l === 1 ? new c( a0, aX, true, this.wordmap.stage ) : new c( a0, aX, false, this.wordmap.stage );
                    this.nodes.push( aX );
                    this.links.push( a7 );
                    if ( a1.children ) { aZ.push( this._parse( a1.children, aX ) ) } else { aZ.push( void 0 ) }
                }
                return aZ
            }
        }, { key: "_computeRingRadii", value: function aU () { var aV; if ( this.ringRadius != null ) { return } aV = Math.min( this.centerPoint.x, this.centerPoint.y ); return this.ringRadius = [ 0, aV * 9 / 25, aV * 16 / 25, aV ] } }, {
            key: "_buildLayout",
            value: function aK ( bc ) {
                var a0, aW, a1, a3, ba, a9, a7, bb, aY, aV, a6, aX, a4, a5, a8, aZ, bd;
                if ( !bc ) { return } aW = bc.wedge();
                a8 = bc.startAngle();
                bd = bc.totalBloom();
                aX = bc.childNodes;
                for ( a9 = 0, bb = aX.length; a9 < bb; a9++ ) {
                    a6 = aX[ a9 ];
                    a1 = a6.maxBloom();
                    aV = 150;
                    a3 = aW * ( a1 / bd );
                    a0 = Math.min( aV, a3 );
                    aZ = -a8 - a0 / 2;
                    a6.setSlice( a0, a8, aZ );
                    a8 += a0;
                    ba = this._coordinatesFromAngle( a6.distance_from_center(), aZ );
                    a6.updatePosition( ba.x, ba.y )
                }
                a4 = bc.childNodes;
                a5 = [];
                for ( a7 = 0, aY = a4.length; a7 < aY; a7++ ) {
                    a6 = a4[ a7 ];
                    a5.push( this._buildLayout( a6 ) )
                }
                return a5
            }
        }, {
            key: "_drawRings",
            value: function aN () {
                var a3, aY, aW, aV, a0, aZ, aX, a1;
                a1 = new createjs.Container();
                this.container.addChild( a1 );
                this.container.setChildIndex( a1, 1 );
                aZ = this.ringRadius;
                aX = [];
                for ( aY = aW = 0, aV = aZ.length; aW < aV; aY = ++aW ) {
                    a0 = aZ[ aY ];
                    if ( aY !== 0 ) {
                        a3 = new createjs.Shape();
                        a3.graphics.beginFill( "#607784" ).drawCircle( 0, 0, a0 );
                        a3.x = this.centerPoint.x;
                        a3.y = this.centerPoint.y;
                        a3.alpha = 1 / aY;
                        aX.push( a1.addChild( a3 ) )
                    } else { aX.push( void 0 ) }
                }
                return aX
            }
        }, {
            key: "show",
            value: function aT () {
                var a4, a1, aZ, a9, a5, a3, a0, aY, aX, aV, aW, ba, a8, a7, a6;
                aW = this.links;
                for ( a4 = 0, a9 = aW.length; a4 < a9; a4++ ) {
                    aZ = aW[ a4 ];
                    this.container.addChild( aZ )
                }
                ba = this.nodes;
                for ( a1 = 0, a5 = ba.length; a1 < a5; a1++ ) {
                    aX = ba[ a1 ];
                    this.container.addChild( aX );
                    aX.x = this.centerPoint.x;
                    aX.y = this.centerPoint.y;
                    aX.setupAnimation( this.centerPoint )
                }
                this.container.addChild( this.rootNode );
                this.rootNode.show( this.centerPoint, this.animate );
                a8 = this.nodes;
                for ( aY = 0, a3 = a8.length; aY < a3; aY++ ) {
                    aX = a8[ aY ];
                    aX.show( this.centerPoint, this.animate )
                }
                if ( this.animate ) {
                    return setTimeout( function ( bb ) {
                        return function () {
                            var bd, bf, bc, be;
                            bc = bb.links;
                            be = [];
                            for ( bf = 0, bd = bc.length; bf < bd; bf++ ) {
                                aZ = bc[ bf ];
                                be.push( aZ.show( false ) )
                            }
                            return be
                        }
                    }( this ), this.ANIMATION_DURATION + 10 )
                } else {
                    a7 = this.links;
                    a6 = [];
                    for ( aV = 0, a0 = a7.length; aV < a0; aV++ ) {
                        aZ = a7[ aV ];
                        a6.push( aZ.show( false ) )
                    }
                    return a6
                }
            }
        }, {
            key: "_jitter",
            value: function aQ () {
                var a6, a8, a7, a4, a1, aZ, aY, a5, a3, aW, aV, aX, a0;
                a5 = this._labelNodesByLevel();
                aX = this.ringRadius;
                a0 = [];
                for ( a1 = aZ = 0, a3 = aX.length; aZ < a3; a1 = ++aZ ) {
                    aV = null;
                    aW = a5[ a1 ];
                    a0.push( function () {
                        var a9, bb, ba;
                        ba = [];
                        for ( a1 = a9 = 0, bb = aW.length; a9 < bb; a1 = ++a9 ) {
                            a6 = aW[ a1 ];
                            if ( a1 === 0 ) { aV = a6; continue } a8 = a6.collides( aV );
                            a4 = 0;
                            aY = Math.random() > 0.5 ? 5 : -5;
                            while ( a8 ) {
                                a6.accumulateJitter( aY );
                                a7 = this._coordinatesFromAngle( a6.distance_from_center() + a6.jitter, a6.theta() );
                                a6.updatePosition( a7.x, a7.y );
                                a8 = a6.collides( aV );
                                a4 += 1;
                                if ( a4 > 8 ) { break }
                            }
                            ba.push( aV = a6 )
                        }
                        return ba
                    }.call( this ) )
                }
                return a0
            }
        }, {
            key: "_labelNodesByLevel",
            value: function aL () {
                var a4, a0, aY, aX, a1, aZ, aV, aW, a3;
                aV = {};
                aW = this.ringRadius;
                for ( a0 = aY = 0, a1 = aW.length; aY < a1; a0 = ++aY ) { aV[ a0 ] = [] } a3 = this.nodes;
                for ( aX = 0, aZ = a3.length; aX < aZ; aX++ ) { a4 = a3[ aX ]; if ( a4.type === "label" ) { aV[ a4.level ].push( a4 ) } }
                return aV
            }
        }, {
            key: "_coordinatesFromAngle",
            value: function aI ( aW, aX ) {
                var aV, aY;
                aV = aW * Math.cos( aX * Math.PI / 180 );
                aY = aW * Math.sin( aX * Math.PI / 180 );
                aV += this.centerPoint.x;
                aY += this.centerPoint.y;
                return { x: aV, y: aY }
            }
        } ] );
        return aP
    }();

    function w ( aI, aJ ) { if ( !( aI instanceof aJ ) ) { throw new TypeError( "Cannot call a class as a function" ) } }

    function G ( aL, aJ ) {
        for ( var aI = 0; aI < aJ.length; aI++ ) {
            var aK = aJ[ aI ];
            aK.enumerable = aK.enumerable || false;
            aK.configurable = true;
            if ( "value" in aK ) { aK.writable = true } Object.defineProperty( aL, aK.key, aK )
        }
    }

    function B ( aK, aI, aJ ) { if ( aI ) { G( aK.prototype, aI ) } if ( aJ ) { G( aK, aJ ) } return aK }
    var K = function () {
        function aJ ( aR, aQ ) {
            w( this, aJ );
            this.containerEl = aR;
            this.stage = null;
            this.nextGraph = null;
            this.history = [];
            this.currHistoryIndex = 0;
            this.updateHistoryButtons = this.updateHistoryButtons.bind( this );
            this._renderHistory();
            this._attachHistoryListeners();
            this._init( aQ )
        }
        B( aJ, [ {
            key: "_init",
            value: function aN ( aQ ) {
                var aR = this;
                this._buildStage();
                this.currentGraph = new aw( aQ, this );
                this.currentGraph.fetch().then( function () {
                    aR.currentGraph.addToStage();
                    aR.history.push( aQ );
                    aR.currentGraph.draw()
                } )[ "catch" ]( function ( aS ) { console.error( aS ); return aS } )
            }
        }, {
            key: "resize",
            value: function aL () {
                var aQ = this.containerEl.querySelector( "canvas" );
                this.containerEl.removeChild( aQ );
                this._init( this.history[ this.currHistoryIndex ] )
            }
        }, {
            key: "updateHistoryButtons",
            value: function aI () {
                if ( this.history.length <= 1 ) { return }
                var aQ = this.containerEl.getElementsByClassName( "back" )[ 0 ];
                var aR = this.containerEl.getElementsByClassName( "forward" )[ 0 ];
                if ( this.currHistoryIndex > 0 ) { aQ.disabled = false; if ( this.currHistoryIndex === this.history.length - 1 ) { aR.disabled = true } else { aR.disabled = false } } else {
                    aQ.disabled = true;
                    aR.disabled = false
                }
            }
        }, {
            key: "_renderHistory",
            value: function aM () {
                var aQ = document.createElement( "div" );
                aQ.classList.add( "wordmap-history" );
                aQ.innerHTML = '<button class="wordmap-action back" data-action="back" disabled>&#60;</button><button class="wordmap-action forward" data-action="forward" disabled>&#62;</button>';
                this.containerEl.appendChild( aQ )
            }
        }, {
            key: "_attachHistoryListeners",
            value: function aK () {
                var aQ = this;
                this.containerEl.addEventListener( "click", function ( aR ) {
                    if ( !aR.target.classList.contains( "wordmap-action" ) ) { return }
                    var aS = aR.target.getAttribute( "data-action" );
                    if ( aS === "back" ) { if ( aQ.currHistoryIndex <= 0 ) { return } aQ.currHistoryIndex = aQ.currHistoryIndex - 1 } else { if ( aS === "forward" ) { if ( aQ.currHistoryIndex >= aQ.history.length - 1 ) { return } aQ.currHistoryIndex = aQ.currHistoryIndex + 1 } } aQ.nextGraph = new aw( aQ.history[ aQ.currHistoryIndex ], aQ );
                    aQ.nextGraph.fetch().then( function () {
                        aQ.currentGraph.removeFromStage();
                        aQ.nextGraph.addToStage();
                        aQ.nextGraph.draw();
                        aQ.currentGraph = aQ.nextGraph;
                        aQ.nextGraph = null
                    } )
                }, false )
            }
        }, {
            key: "_buildStage",
            value: function aP () {
                var aR, aQ;
                this.canvas = document.createElement( "canvas" );
                this.containerEl.appendChild( this.canvas );
                aR = this.containerEl.offsetHeight;
                aQ = this.containerEl.offsetWidth;
                this.canvas.width = aQ;
                this.canvas.height = aR;
                this.stage = new createjs.Stage( this.canvas );
                this.stage.width = this.canvas.width;
                this.stage.height = this.canvas.height;
                this.stage.enableMouseOver( 10 );
                this._retinize();
                this.ticker = createjs.Ticker;
                return this.ticker.addEventListener( "tick", this.stage )
            }
        }, {
            key: "_retinize",
            value: function aO () {
                var aQ;
                aQ = window.devicePixelRatio || 1;
                this.canvas.style.width = this.canvas.width + "px";
                this.canvas.style.height = this.canvas.height + "px";
                this.canvas.width *= aQ;
                this.canvas.height *= aQ;
                this.stage.scaleX = aQ;
                return this.stage.scaleY = aQ
            }
        } ] );
        return aJ
    }();
    var J = ( K )
} ) ] );
MB.showDefinitionOnCorrectAnswer = function () {
    Ext.getBody().on( "click", function ( c ) {
        var a = c.getTarget( ".choice", 2, true );
        var b = Ext.select( ".question .status.wrong" ).first();
        if ( a && a.findParent( "#context" ) ) {
            if ( a.hasClass( "answer" ) ) {
                a.addClass( "correct" );
                b.fadeOut();
                MB.showDefinition();
                if ( !Ext.get( "no_autoplay_definition" ) ) { MB.playDefinition() }
            } else {
                a.addClass( "wrong" );
                b.fadeIn()
            }
        }
    }, this, { delegate: "#choice-section" } )
};
// IMPORTANT
MB.showDefinition = function () { var a = Ext.select( "#definition .def-bubble" ).first(); if ( a ) { a.enableDisplayMode().show( { callback: function ( b ) { MB.flash( "#one-word-tab em", 0.5 ) }, useDisplay: true } ) } };
MB.playDefinition = function () {
    var a = Ext.get( "definition-sound" );
    if ( a ) {
        var b = MB.findOrCreateWordAudioPlayer();
        b.play( b.extractAudioPath( a ) )
    }
};
MB.activateDefinitionPopup = function () {
    Ext.getBody().on( "click", function ( a ) {
        a.stopEvent();
        Ext.select( "#definition .def-bubble" ).enableDisplayMode().toggle()
    }, this, { delegate: ".show-definition" } )
};
MB.activateMakeNewHooks = function () {
    Ext.getBody().on( "click", function ( b, a ) {
        b.stopEvent();
        MB.makeNewHook( Ext.get( "memhook" ), Ext.fly( a ).getAttribute( "url" ) )
    }, this, { delegate: "#memhook-use-own" } )
};
// WHAT
MB.getWord = function () { var a = Ext.select( "h1.wordform" ).first(); if ( a ) { return a.getText() } };
MB.initWord = function ( a ) {
    MB.pronounceWord();
    MB.activateToolTips();
    MB.Sticky.addSaveHandler( Ext.select( ".note" ).first() );
    MB.activateModalCalloutBox()
};
MB.bootstrapWordPage = function () { // THIS USEFUL
    Ext.QuickTips.init();
    MB.activateQuickHelpPopups();
    MB.Sticky.init();
    MB.activateWordTheater();
    MB.showDefinitionOnCorrectAnswer();
    MB.activateDefinitionPopup();
    MB.showBackground();
    MB.activateRootTrees();
    MB.activateOriginMap();
    MB.activateInteractiveWordMap();
    MB.showRelatedWordDefs();
    MB.activateMakeNewHooks();
    MB.setupPublicHookSlideShow();
    MB.openFastDictInBox();
    MB.activateHowToUsePanel()
};
Ext.onReady( function () {
    if ( Ext.get( "customized_words" ) ) {
        MB.bootstrapWordPage();
        MB.initWord();
        if ( Ext.get( "ikt" ) ) {
            Ext.get( "ikt" ).on( "click", function ( b, a ) {
                b.preventDefault();
                MB.spinnerOn( Ext.get( a ).parent() );
                Ext.Ajax.request( { url: location.href, failure: MB.AjaxGenericFailureMsg, method: "POST", params: { _method: "PUT", skip_this: true }, success: function ( c ) { var d = Ext.decode( c.responseText ); if ( d.success ) { Ext.get( a ).addClass( "ikt-active" ).highlight() } } } )
            } )
        }
    }
} );
Ext.onReady( function () {
    if ( !Ext.get( "tour-navigation" ) ) { return }
    var a = function () { Ext.select( "#salient-points > li" ).each( function ( b ) { b.enableDisplayMode().fadeOut() } ) };
    Ext.getBody().on( "click", function ( f, c ) {
        f.stopEvent();
        var d = Ext.get( c );
        d.addClass( "current" );
        var b = Ext.get( c ).getAttribute( "data-url" );
        a();
        Ext.get( b ).fadeIn()
    }, this, { delegate: ".tnb" } )
} );
window.MBloadExemplar = function ( a ) {
    var c = Ext.urlDecode( window.location.search.substring( 1 ) );
    var b = MB.isBot() ? 0 : ( parseInt( c.wait, 10 ) || 2.5 );
    a = a == undefined ? b : a;
    MB.expandBackground.defer( a * 1000 );
    MB.pronounceWord();
    MB.bootstrapWordPage()
};
Ext.onReady( function () { if ( Ext.get( "exemplars" ) && ( Ext.select( ".full-word-page" ).getCount() > 0 ) ) { window.MBloadExemplar() } } );
// IMPORTANT
MB.FastDict = Ext.extend( Ext.util.Observable, {
    constructor: function ( a ) {
        this.config = a || {};
        Ext.apply( this, a );
        Ext.Updater.defaults.showLoadIndicator = false;
        this.wrapperEl = Ext.get( a.wrapperEl );
        this.formEl = this.wrapperEl.child( "form" );
        this.inputEl = this.formEl.child( "input" );
        this.numCompletions = a.numCompletions || 9;
        this.defnDisplayEl = this.wrapperEl.child( ".fastdict-defnbox" );
        this.defnDisplayUpdater = this.defnDisplayEl.getUpdater();
        this.suggestionDisplayEl = this.wrapperEl.child( ".fastdict-suggestion-box" );
        this.suggestionDisplayUpdater = this.suggestionDisplayEl.getUpdater();
        this.suggestionDisplayEl.enableDisplayMode();
        this.defnDisplayEl.enableDisplayMode();
        this.addListeners();
        this.defnShown = false;
        this.inputEl.focus();
        this.lastWordShown = null;
        this.baseUrl = "//slowmo.membean.com";
        this.addEvents( { changedWord: true } )
    },
    addListeners: function () {
        this.addKeyStrokeListener();
        this.addWordClickListener();
        this.addWordLinksListener( this.defnDisplayEl );
        this.addWordLinksListener( Ext.select( "h2 a" ) )
    },
    addKeyStrokeListener: function () {
        this.inputEl.on( "keyup", function ( c ) {
            c.stopEvent();
            var b = this.inputEl.dom.value;
            if ( this.defnShown ) {
                this.defnDisplayEl.hide();
                this.defnShown = false
            }
            var a = null;
            if ( b ) { if ( this.enterKeyPressed( c ) ) { this.displayWordDefn( b ) } else { if ( a = this.numberKeyPressed( c ) ) { this.displayNumberedDefn( a ) } else { this.displayCompletion( b ) } } } else { this.resetDisplay() }
        }, this )
    },
    enterKeyPressed: function ( a ) { return MB.keyCode( a ) == 13 },
    numberKeyPressed: function ( c ) { var a = false; var b = MB.keyCode( c ); if ( b >= 49 && b < 49 + this.numCompletions ) { a = b - 48 } return a },
    displayNumberedDefn: function ( a ) { var b = Ext.get( a + "" ); if ( b ) { var c = b.getText(); if ( c ) { this.displayWordDefn( c ) } } },
    displayWordDefn: function ( c, b ) {
        if ( c == this.lastWordShown ) { return } this.lastWordShown = c;
        var a = this.baseUrl + "/fastdict_defn/" + c;
        Ext.ux.JSONP.request( a, {
            params: { format: "json" },
            callback: function ( d ) {
                this.defnDisplayEl.update( "<h2>" + c + "</h2>" + d );
                this.inputEl.dom.value = "";
                this.suggestionDisplayEl.fadeOut();
                this.defnShown = true;
                this.defnDisplayEl.fadeIn()
            },
            scope: this
        } );
        if ( !b ) { this.fireEvent( "changedWord", c ) }
    },
    displayCompletion: function ( b ) {
        if ( !this.suggestionDisplayEl.isVisible() ) { this.suggestionDisplayEl.fadeIn() }
        var a = this.baseUrl + "/fastdict_glob/" + b;
        Ext.ux.JSONP.request( a, { params: { format: "json" }, scope: this, callback: function ( c ) { this.suggestionDisplayEl.update( c ) } } )
    },
    resetDisplay: function ( a ) { if ( a == undefined ) { a = true } this.inputEl.dom.value = ""; if ( a ) { this.defnDisplayEl.dom.innerHTML = "" } this.suggestionDisplayEl.dom.innerHTML = "" },
    addWordClickListener: function () { this.suggestionDisplayEl.on( "click", function ( c ) { c.stopEvent(); var b = Ext.fly( c.getTarget() ); if ( b.hasClass( "fw" ) ) { var a = b.getText(); if ( a ) { this.displayWordDefn( a ) } } }, this ) },
    addWordLinksListener: function ( a ) { a.on( "click", function ( d ) { d.stopEvent(); var c = Ext.fly( d.getTarget() ); if ( c && c.dom.href ) { var b = c.getText(); if ( b ) { this.displayWordDefn( b ) } } }, this ) }
} );
MB.activateFastDict = function () { this.fastdict = new MB.FastDict( { wrapperEl: "fastdicts" } ); return this.fastdict };
MB.openFastDictInBox = function () { Ext.getBody().on( "click", function ( a ) { a.stopEvent(); if ( Shadowbox ) { Shadowbox.open( { player: "inline", title: "Dictionary", content: "#fastdict-embedded-wrapper", height: 450, width: 800, options: { onFinish: function ( b ) { new MB.FastDict( { wrapperEl: Ext.get( "sb-player" ) } ) } } } ) } }, this, { delegate: "#dictionary-icon" } ) };
if ( Ext.onReady( function () { if ( !Ext.get( "fastdicts" ) ) { return } this.fastdict = MB.activateFastDict(); var a = Ext.fly( "auto-load" ); if ( a ) { var b = a.getText(); if ( b ) { this.fastdict.displayWordDefn( b ) } } } ) ) { } MB.makeButtonBar = function ( a ) {
    return;
    if ( !a ) { return }
    var b = Ext.DomHelper.append( a.child( "p" ), { cls: "panel-button-bar" } );
    MB.editButton( b );
    MB.removeButton( b )
};
var addHookT = new Ext.Template( '<div class="hook">', '<span url="{new_url}"></span>', '<p><img src="{img}"/>{text}</p></div>' );
var addHookT_noimg = new Ext.Template( '<div class="hook">', '<span url="{new_url}"></span><p>{text}</p>' );
var updateHookT = new Ext.Template( '<span url="{new_url}"></span>', '<p><img src="{img}"/>{text}</p>' );
var updateHookT_nomimg = new Ext.Template( '<span url="{new_url}"></span>', "<p>{text}</p>" );
MB.extractUrlAndText = function ( e ) {
    result = {};
    if ( e ) {
        var b = ( e.child( "span" ).attributes() )[ "url" ];
        var c = e.child( "p" ).getText();
        var d = e.child( "p img" );
        var a = d ? ( d.attributes() )[ "src" ] : "";
        result = { url: b, text: c, img: a }
    }
    return result
};
MB.updateHookData = function ( l, g, e, k, c ) {
    var a = Ext.decode( e.responseText );
    var b = a.data.msg || null;
    if ( !k ) {
        var h = Ext.get( "memhook" ).child( ".content" );
        var j = g ? addHookT : addHookT_noimg;
        k = Ext.fly( j.insertFirst( h, { text: l, new_url: a.data.url, img: g } ) )
    } else {
        var j = g ? updateHookT : updateHookT_nomimg;
        j.overwrite( k, { text: l, new_url: a.data.url, img: a.data.img, img: g } )
    }
    MB.makeButtonBar( k );
    k.highlight();
    var d = Ext.get( "memhook-slideshow" );
    if ( d ) { Ext.removeNode( d ) }
    var f = Ext.get( "add-public-hook" );
    if ( c ) { f.show(); if ( k && b ) { k.insertHtml( "beforeEnd", "<p class='notice'>" + b + "</p>", true ) } } else { if ( f.getText().search( /other/ ) == -1 ) { f.hide() } }
};
MB.editHook = function ( a ) {
    var b = MB.extractUrlAndText( a );
    new MB.HookPanel( { renderTo: a.parent(), url: b.url, method: "PUT", title: "Edit Hook", initValue: b.text } ).on( "saved", function ( d, c ) { MB.updateHookData( d, b.img, c, a, false ) } )
};
MB.removeHook = function ( b ) {
    MB.spinnerOn( b );
    var c = MB.extractUrlAndText( b );
    Ext.Ajax.request( { url: c.url, method: "DELETE", failure: MB.AjaxGenericFailureMsg, success: function () { b.fadeOut( { remove: true } ) } } );
    var a = Ext.get( "memhook-slideshow" );
    if ( a ) { a.remove() }
};
MB.makeNewHook = function ( c, b ) {
    var b = b;
    var a = "";
    var d = new MB.HookPanel( { renderTo: c, url: b, title: "New Memory Hook" } ).on( "saved", function ( g, e ) {
        var f = c.child( ".content .hook" );
        MB.updateHookData( g, a, e, f, "new" )
    } )
};
MB.setupPublicHookSlideShow = function () {
    MB.MHCarousel = null;
    Ext.getBody().on( "click", function ( c, a ) {
        c.stopEvent();
        var b = Ext.get( "memhook" );
        MB.showMHPanel( b )
    }, this, { delegate: "#add-public-hook" } )
};
MB.showMHPanel = function ( c ) {
    if ( this.MHPanelInProgress ) { return } else { this.MHPanelInProgress = true }
    if ( MB.MHCarousel ) { MB.MHCarousel.clear(); var d = c.child( ".memhook-wrapper" ); var b = Ext.get( "memhook-slideshow" ) } else {
        var e = c.select( "> *" );
        var d = c.insertHtml( "afterBegin", "<div class='memhook-wrapper'/>", true );
        e.each( function ( g ) { g.appendTo( d ) } );
        var b = c.insertHtml( "afterBegin", "<div id='memhook-slideshow' style='display:none'/>", true );
        MB.MHCarousel = new Ext.ux.Carousel( b, { interval: 3, showCloseButton: true, transitionEasing: "easeIn", slideWidth: c.getWidth(), slideHeight: 200, navWidth: 30 * 5 } )
    }
    MB.spinnerOn( c );
    var f = MB.getWord().toLowerCase();
    var a = new Ext.data.JsonStore( { autoDestroy: true, autoLoad: true, url: "/mywords/" + f + "/memory_hooks.json", storeId: "myStore", root: "data", fields: [ "hook", "creator", "url", "img" ] } );
    a.on( "load", function () {
        var g = 0;
        a.each( function ( l ) {
            g += 1;
            var h = l.data.img ? '<img src="' + l.data.img + '"/>' : "";
            var k = Ext.DomHelper.append( document.body, { tag: "div", id: "memhook-item" + g, title: "Memory Hook", cls: "memhook-item", children: [ { tag: "p", html: h + l.data.hook }, { tag: "a", cls: "useme", html: "Use This" } ] } );
            MB.MHCarousel.add( k );
            var j = Ext.get( k ).child( "a" );
            j.on( "click", function ( n, o, m ) {
                return function ( r ) {
                    r.stopEvent();
                    MB.useSlideShowHook( n, o, m, MB.MHCarousel )
                }
            }( l.data.url, l.data.hook, l.data.img ) )
        } );
        MB.MHCarousel.refresh();
        d.enableDisplayMode().hide();
        b.enableDisplayMode().show();
        MB.MHCarousel.on( "close", function () {
            d.show();
            b.hide()
        } );
        this.MHPanelInProgress = false
    }, this )
};
MB.useSlideShowHook = function ( b, d, a, c ) {
    Ext.Ajax.request( {
        url: b,
        method: "GET",
        success: function ( e ) {
            var f = Ext.select( "#memhook .hook" ).first();
            MB.updateHookData( d, a, e, f, false );
            c.close()
        },
        failure: MB.AjaxGenericFailureMsg
    } )
};
// IMPORTANT
MB.wordSpell = function () { if ( Ext.get( "wordspell" ) ) { MB.pronounceWord(); var a = new MB.ClozeQuestion( { timer: null, fullSpell: true, callback: { correct: function () { a.updateResult( true ) }, incorrect: function () { a.updateResult( false ) }, spell: function ( d, c, b ) { a.warnSpelling( d, c, b ) } }, showAnswer: true } ); return a } };
MB.userSelectContextCues = function () {
    var a = [];
    var b = [];
    var d = Ext.get( "contextcues-results" );
    Ext.select( ".cc" ).each( function ( e ) { a.push( e.getText() ) } );
    var c = Ext.get( "contextcues" );
    if ( c && a.length > 0 ) {
        c.on( "mouseup", function () {
            var f = MB.getSelectedText();
            if ( f != "" ) {
                f = String( f );
                f = f.trim();
                var j = new RegExp( f );
                var h = false;
                for ( var g = 0; g < a.length; ++g ) {
                    var e = a[ g ];
                    if ( e.match( j ) ) {
                        d.insertHtml( "beforeEnd", "<h3 class='correct'>" + e + "</h3>", true ).fadeIn();
                        h = true
                    }
                }
                if ( !h ) { d.insertHtml( "beforeEnd", "<h3 class='wrong'>" + f + "</h3>", true ).fadeIn() }
            }
        } )
    }
};
Ext.onReady( function () { if ( Ext.get( "interstitials" ) ) { q = MB.wordSpell(); if ( q ) { MB.Review.showAnswerBox() } MB.userSelectContextCues() } } );
Array.prototype.clone = function () { return this.slice( 0 ) };
// GERMAN??
MB.levenshtein = function () {
    var b = Math.min;
    try { split = !( "0" )[ 0 ] } catch ( a ) { split = true }
    return function ( r, n ) {
        if ( r == n ) { return 0 }
        if ( !r.length || !n.length ) { return n.length || r.length }
        if ( split ) {
            r = r.split( "" );
            n = n.split( "" )
        }
        var g = r.length + 1,
            f = n.length + 1,
            u = 0,
            k = 0,
            l = [ 0 ],
            m, h = 0,
            o, e;
        while ( ++h < f ) { l[ h ] = h } k = 0;
        while ( ++k < g ) {
            o = h = 0;
            m = r[ u ];
            e = l.clone();
            l = [ k ];
            while ( ++h < f ) { l[ h ] = b( e[ h ] + 1, l[ o ] + 1, e[ o ] + ( m != n[ o ] ) ); ++o } ++u
        }
        return l[ f - 1 ]
    }
}();
MB.hideAllPanels = function () {
    Ext.select( ".panel" ).each( function ( a ) {
        a.enableDisplayMode();
        a.hide()
    } )
};
MB.showOnlySinglePanel = function () {
    var a = Ext.get( "panel-container" );
    if ( a ) {
        a.enableDisplayMode();
        MB.hideAllPanels();
        a.show();
        Ext.select( ".panel" ).each( function ( c ) {
            var d = c.dom.id + "-link";
            var b = Ext.get( d );
            b.on( "click", function ( h, g ) {
                h.stopEvent();
                MB.hideAllPanels();
                var f = Ext.get( g.id.substring( 0, g.id.length - 5 ) );
                f.show()
            } )
        } )
    }
};
Ext.onReady( function () { if ( !Ext.get( "question-showcase" ) ) { return } } );
Ext.ns( "MB.Review" );
// INCREDIBLY IMPORTANT
MB.Question = Ext.extend( Ext.util.Observable, {
    constructor: function ( a ) {
        this.config = a || {};
        this.timer = null;
        Ext.apply( this, a );
        MB.Question.superclass.constructor.call( this, a );
        this.addEvents( { correct: true, incorrect: true, dontknow: true, spell: true, statusUpdated: true } );
        if ( a.callback ) {
            if ( a.callback.correct ) {
                this.on( "correct", function () {
                    this.removeInputListeners();
                    a.callback.correct.call( this );
                    if ( a.showAnswer ) {
                        this.stopProgressBar();
                        this.showCorrectAnswer()
                    }
                }, this )
            }
            if ( a.callback.incorrect ) {
                this.on( "incorrect", function () {
                    this.removeInputListeners();
                    a.callback.incorrect.call( this );
                    if ( a.showAnswer ) {
                        this.stopProgressBar();
                        this.delayedShowCorrectAnswer( 1 )
                    }
                }, this )
            }
            if ( a.callback.dontknow ) {
                this.on( "dontknow", function () {
                    this.removeInputListeners();
                    a.callback.dontknow.call( this );
                    if ( a.showAnswer ) {
                        this.stopProgressBar();
                        this.showCorrectAnswer()
                    }
                }, this )
            }
            if ( a.callback.spell ) {
                this.on( "spell", function ( d, c, b ) {
                    this.removeInputListeners();
                    a.callback.spell.call( this, d, c, b );
                    if ( a.showAnswer ) {
                        this.stopProgressBar();
                        this.showCorrectAnswer()
                    }
                }, this )
            }
        }
        if ( this.config.timer ) {
            this.timeout = a.timer.timeout || 8;
            this.timerRenderTo = a.timer.renderTo;
            this.timer = new MB.Timer( { renderTo: this.timerRenderTo, nsecs: this.timeout } )
        }
    },
    stopProgressBar: function () { if ( this.timer ) { this.timer.stop() } },
    focusInput: function () { },
    removeInputListeners: function () { },
    startProgressBar: function () {
        if ( this.timer ) {
            this.timer.start();
            this.timer.on( "timedOut", function () { this.fireEvent( "incorrect" ) }, this )
        }
    },
    delayedShowCorrectAnswer: function ( a ) { new Ext.util.DelayedTask( this.showCorrectAnswer, this ).delay( a * 1000 ) },
    showCorrectAnswer: function () { throw "Not implemented: Please implement" }, //
    updateResult: function ( a ) {
        var b = this.config.resultEl || Ext.get( "answer-status" );
        b.update( a ? "<h1 class='correct'>Correct!</h1>" : "<h1 class='incorrect'>Incorrect!</h1>" ).fadeIn();
        b.focus();
        this.fireEvent( "statusUpdated", a )
    },
    warnSpelling: function ( e, d, a ) {
        var c = a == 1 ? "letter" : "letters";
        var b = this.config.resultEl || Ext.get( "answer-status" );
        b.update( "<div class='spelling-error'><span class='incorrect'>" + e + "</span><span>&rarr;</span><span class='success'>" + d + "</span><h2>Check Spelling!<br/><span>off by " + a + " " + c + "</span></h2></div>" );
        b.focus().fadeIn();
        this.fireEvent.defer( 5 * 1000, this, [ "statusUpdated", true ] )
    },
    proceed: function () { this.fireEvent( "statusUpdated", false ) },
    dstr: function ( a ) { str1 = ""; for ( i = 0; i < a.length; ++i ) { str1 += String.fromCharCode( a.charCodeAt( i ) ^ 14 ) } result = B4.decode( str1 ); return result }
} );
// INCREDIBLY IMPORTANT
MB.ClozeQuestion = Ext.extend( MB.Question, {
    constructor: function ( a ) {
        this.letterHint = Ext.get( "letter-hint" );
        this.notsure = Ext.select( ".cloze #notsure" ).first();
        var b = Ext.select( ".first-letter" ).first();
        this.firstLetter = b ? b.getText() : "";
        this.firstLetterCorrection = b ? 1 : 0;
        a = a || {};
        Ext.apply( this, a );
        MB.ClozeQuestion.superclass.constructor.call( this, a );
        this.fullSpell = this.fullSpell || Ext.get( "fullspell_cloze" );
        this.answer = this.retrieveClozeAnswer();
        this.answerBox = Ext.get( "answer-box" );
        this.formInput = Ext.get( "single-question" ).child( "input" );
        this.lastLetter = null;
        this.letterBoxes = this.answerBox.select( ".letter-wrapper" );
        this.addListeners();
        this.formInput.focus();
        this.computeInputLength()
    },
    focusInput: function () { this.formInput.focus() },
    computeInputLength: function ( a ) { if ( this.fullSpell ) { this.inputLength = this.answer.length - this.firstLetterCorrection } else { this.inputLength = 3 } },
    addListeners: function () {
        if ( this.letterHint ) { this.letterHint.on( "click", this.handleLetterHint, this ); var a = new Ext.KeyMap( this.formInput, { key: 72, shift: true, fn: this.fillInNextLetter, scope: this, stopEvent: true } ) }
        if ( this.notsure ) {
            this.notsure.on( "click", function ( c, b ) {
                c.stopEvent();
                this.fireEvent( "dontknow" )
            }, this, { single: true } )
        }
        this.formInput.on( "keydown", function ( b ) { this.keyDownCallback() }, this );
        this.formInput.on( "keyup", function ( b ) { this.keyUpCallback(); if ( this.formInput.dom.value.length >= this.inputLength ) { this.checkAnswer() } }, this );
        this.formInput.on( "keypress", function ( b ) {
            if ( this.formInput.dom.value.length >= this.inputLength ) {
                this.keyUpCallback();
                this.checkAnswer()
            }
        }, this );
        this.formInput.parent( "form" ).on( "submit", function ( b ) { b.stopEvent() }, this )
    },
    keyDownCallback: function () {
        var curLetter = this.letterBoxes.item( this.formInput.dom.value.length );
        this.yPos = this.yPos || curLetter.getY();
        if ( curLetter ) { with ( curLetter ) { setY( this.yPos + 10 ) } } this.lastLetter = curLetter
    },
    keyUpCallback: function () {
        this.lastLetter = null;
        this.letterBoxes.each( function ( a ) {
            this.yPos = this.yPos || a.getY();
            a.setY( this.yPos )
        }, this )
    },
    retrieveClozeAnswer: function () {
        answerId = "google-analytics-mb";
        data = this.dstr( Ext.get( answerId ).getAttribute( "data-value" ) );
        data1 = data.substr( 10 );
        cloze_answer_txt = data1.substr( 0, data1.length - 10 );
        return cloze_answer_txt
    },
    checkAnswer: function () {
        this.formInput.removeAllListeners();
        var c = this.formInput.dom.value.toLowerCase();
        var e = c.substr( 0, this.inputLength );
        var b = this.answer.substr( this.firstLetterCorrection, this.inputLength );
        e = this.firstLetter + e;
        b = this.firstLetter + b;
        var a = this.fullSpell ? 2 : 1;
        if ( e == b ) { this.fireEvent( "correct" ) } else { var d = MB.levenshtein( e, b ); if ( d <= a ) { this.fireEvent( "spell", e, b, d ) } else { this.fireEvent( "incorrect" ) } }
    },
    showCorrectAnswer: function () {
        this.formInput.dom.value = this.answer.substr( this.firstLetterCorrection, this.answer.length - this.firstLetterCorrection );
        this.formInput.removeAllListeners()
    },
    fillInSecondLetter: function () {
        this.formInput.dom.value = this.answer.substr( this.firstLetterCorrection, 1 );
        this.focusInput();
        if ( document.selection ) {
            var a = document.selection.createRange();
            a.moveStart( "character", 2 );
            a.select()
        }
    },
    handleLetterHint: function ( a ) {
        a.stopEvent();
        this.fillInSecondLetter()
    },
    removeInputListeners: function () { this.formInput.removeAllListeners() }
} );
// INCREDIBLY IMPORTANT
MB.MCQuestion = Ext.extend( MB.Question, {
    constructor: function ( b, a ) {
        this.choiceEls = b;
        this.notsure = Ext.get( "notsure" );
        a = a || {};
        Ext.apply( this, a );
        MB.MCQuestion.superclass.constructor.call( this, a );
        if ( this.choiceEls ) { this.addListeners() }
    },
    addListeners: function () {
        if ( this.notsure ) {
            this.notsure.on( "click", function ( b ) {
                b.stopEvent();
                var a = b.getTarget( ".choice", 2, true );
                a.addClass( "wrong" );
                this.fireEvent( "dontknow" )
            }, this, { single: true } )
        }
        this.choiceEls.on( "click", function ( b ) {
            b.stopEvent();
            var a = Ext.fly( b.getTarget() );
            if ( !( MB.userEvent( b.browserEvent ) ) ) { }
            if ( !a.hasClass( "choice" ) ) { a = a.parent( ".choice" ) }
            if ( a.dom.id == "notsure" ) { return } a.removeClass( "choice-hover" );
            if ( this.correctChoice( a ) ) {
                a.addClass( "correct" );
                this.fireEvent( "correct" )
            } else {
                a.addClass( "wrong" );
                this.fireEvent( "incorrect" )
            }
        }, this, { single: true } )
    },
    correctChoice: function ( a ) {
        answerId = "google-analytics-mb";
        data = this.dstr( Ext.get( answerId ).getAttribute( "data-value" ) );
        data1 = data.substr( 10 );
        correct_answer_idx = data1.substr( 0, data1.length - 10 );
        answered_choice_idx = a.getAttribute( "data-value" );
        return correct_answer_idx == answered_choice_idx
    },
    showCorrectAnswer: function () {
        this.choiceEls.removeAllListeners();
        that = this;
        this.choiceEls.each( function ( a ) { if ( that.correctChoice( a ) ) { a.addClass( "correct" ); return } } );
        this.removeInputListeners()
    },
    removeInputListeners: function () { this.choiceEls.removeAllListeners() },
    autoClickDetected: function () { this.fireEvent( "autoclick", false ) }
} );
// INCREDIBLY IMPORTANT
MB.Review.activateClozeQuestion = function () { var b = Ext.get( "timer-container" ).dom.getAttribute( "data-timeout" ) || 25; var a = new MB.ClozeQuestion( { timer: { renderTo: "timer-container", timeout: b }, callback: { correct: function () { a.updateResult( true ) }, incorrect: function () { a.updateResult( false ) }, dontknow: function () { a.proceed() }, spell: function ( e, d, c ) { a.warnSpelling( e, d, c ) } }, showAnswer: true } ); return a };
MB.Review.activateMCQuestion = function () { var a = Ext.get( "timer-container" ).dom.getAttribute( "data-timeout" ) || 20; var b = new MB.MCQuestion( Ext.select( "#choice-section .choice" ), { timer: { renderTo: "timer-container", timeout: a }, callback: { correct: function () { b.updateResult( true ) }, incorrect: function () { b.updateResult( false ) }, dontknow: function () { b.proceed() }, autoclick: function () { b.autoClickDetected() } }, showAnswer: true } ); return b };
MB.Review.activateQuestion = function () {
    var a = null;
    if ( Ext.select( ".cloze" ).first() ) {
        a = MB.Review.activateClozeQuestion();
        MB.Review.showAnswerBox()
    } else { a = MB.Review.activateMCQuestion() }
    return a
};
MB.Review.showAnswerBox = function () { var b = Ext.get( "answer-box" ); if ( b ) { b.show().focus(); var a = b.child( "input" ); if ( a ) { a.focus( [ 1000 ] ) } } };
MB.Review.initQuestion = function () { return MB.Review.activateQuestion() };
Ext.onReady( function () { if ( Ext.get( "exemplar-gallery" ) ) { return } if ( Ext.get( "reviews" ) || Ext.get( "questions" ) ) { MB.Review.activateQuestion().startProgressBar() } } );
MB.NotePanel = function ( b ) {
    this.config = b;
    var d = { title: b.title, frame: true, footer: false, floating: true, url: b.url, renderTo: b.renderTo, autoscroll: true, width: "100%", minHeight: 100, items: this.items(), buttons: [ { text: "Cancel", handler: function () { a.destroy() } }, { text: "Save", handler: function () { a.getForm().submit( { params: this.additionalParams(), method: this.config.method } ) }, scope: this } ] };
    if ( Ext.isIE7 ) { d.floating = false }
    var a = new Ext.form.FormPanel( d );
    this.addEvents( "saved" );
    a.setPosition( 0, 0 );
    this.p = Ext.get( b.renderTo );
    if ( this.p.getHeight() < 160 ) { this.p.setHeight( 160 ) }
    var c = a.getForm();
    c.on( "actioncomplete", this.onactioncomplete, this );
    c.on( "actionfailed", this.onactionfailed, this );
    c.findField( "text" ).focus();
    this.fp = a;
    MB.spinnerOn( a.getEl() )
};
Ext.extend( MB.NotePanel, Ext.util.Observable, {
    additionalParams: function () { var a = this.config.hiddenParamEl; return a ? a.attributes() : {} },
    items: function () { return [ { xtype: "textarea", hideLabel: true, autoscroll: true, name: "text", anchor: "100% 100%", value: this.config.initValue, allowBlank: false } ] },
    onactionfailed: function ( a, b ) {
        switch ( b.failureType ) {
            case Ext.form.Action.CLIENT_INVALID:
            case Ext.form.Action.SERVER_INVALID:
                break;
            case Ext.form.Action.CONNECT_FAILURE:
            default:
                this.destroy();
                MB.AjaxGenericFailureMsg()
        }
    },
    onactioncomplete: function ( b, c ) {
        var d = b.findField( "text" ).getValue();
        var a = c.response;
        this.fireEvent( "saved", d, a );
        this.destroy()
    },
    destroy: function () {
        this.p.setHeight( "100%" );
        this.fp.destroy()
    }
} );
MB.HookPanel = Ext.extend( MB.NotePanel, { items: function () { return [ { xtype: "textarea", hideLabel: true, autoscroll: true, name: "text", anchor: "100% 55%", value: this.config.initValue, allowBlank: false }, { xtype: "checkbox", checked: false, hideLabel: true, name: "checked", boxLabel: "Share this with other users" } ] } } );
MB.Sticky = ( function () {
    return {
        markUnsaved: function ( b ) {
            var a = b.child( ".note-status" );
            a.dom.innerHTML = "Unsaved";
            b.dom.setAttribute( "data-dirty", true )
        },
        dirty: function ( a ) { return a.dom.getAttribute( "data-dirty" ) },
        isnew: function ( a ) { return a.getAttribute( "data-create-url" ) },
        hasText: function ( b ) { var a = b.child( ".note-content" ).getText(); return a },
        destroy: function ( a ) { a.switchOff( { callback: function () { a.remove() } } ) },
        save: function ( b ) {
            if ( !MB.Sticky.hasText( b ) ) { return } MB.spinnerOn( b.child( ".note-content" ) );
            var a = b.getAttribute( "data-update-url" ) || b.getAttribute( "data-create-url" );
            Ext.Ajax.request( {
                url: a,
                params: { text: b.child( ".note-content" ).dom.innerHTML },
                failure: MB.AjaxGenericFailureMsg,
                method: b.getAttribute( "data-create-url" ) ? "POST" : "PUT",
                success: function ( d ) {
                    b.dom.removeAttribute( "data-dirty" );
                    b.highlight();
                    var e = Ext.decode( d.responseText );
                    b.dom.setAttribute( "data-update-url", e.data.url );
                    b.dom.removeAttribute( "data-create-url", e.data.url );
                    var c = b.child( ".note-status" );
                    c.dom.innerHTML = "Saved"
                }
            } )
        },
        remove: function ( a ) { Ext.Ajax.request( { url: a.getAttribute( "data-update-url" ), method: "DELETE", failure: MB.AjaxGenericFailureMsg, success: function () { MB.Sticky.destroy( a ) } } ) },
        addContentHandler: function () {
            var a = Ext.select( ".note" ).first();
            if ( a ) {
                var b = a.child( ".note-content" );
                if ( b ) {
                    b.on( "blur", function () { if ( MB.Sticky.dirty( a ) ) { MB.Sticky.save( a ) } } );
                    b.on( "keypress", function () { MB.Sticky.markUnsaved( a ) } )
                }
            }
        },
        addTrashHandler: function () {
            Ext.getBody().on( {
                click: { fn: function ( c, a ) { c.stopEvent(); var b = c.getTarget( ".note", 4, true ); if ( b ) { MB.Sticky.isnew( b ) ? MB.Sticky.destroy( b ) : MB.Sticky.remove( b ) } }, delegate: ".note-delete" },
                mouseover: {
                    fn: function ( c, a ) {
                        var b = c.getTarget( ".note", 4, true );
                        MB.Sticky.removeSaveHandler( b )
                    },
                    delegate: ".note-delete"
                },
                mouseout: {
                    fn: function ( c, a ) {
                        var b = c.getTarget( ".note", 4, true );
                        MB.Sticky.addSaveHandler( b );
                        MB.Sticky.markDirtyHandler()
                    },
                    delegate: ".note-delete"
                }
            } )
        },
        addSaveHandler: function ( a ) { if ( a ) { a.child( ".note-content" ).on( "blur", function ( c, b ) { if ( MB.Sticky.dirty( a ) ) { MB.Sticky.save( a ) } } ) } },
        removeSaveHandler: function ( a ) { if ( a ) { a.child( ".note-content" ).removeAllListeners() } },
        markDirtyHandler: function () { Ext.getBody().on( "keypress", function ( b ) { var a = b.getTarget( ".note", 4, true ); if ( a && MB.Sticky.hasText( a ) ) { MB.Sticky.markUnsaved( a ) } }, this, { delegate: ".note-content" } ) },
        addClearHandler: function ( a ) {
            if ( a ) {
                a.child( ".note-content" ).on( "click", function ( c, b ) {
                    var d = c.getTarget( ".note-content", 5, true );
                    d.dom.innerHTML = "&nbsp;"
                }, this, { single: true } )
            }
        },
        createHandler: function () {
            Ext.getBody().on( "click", function ( g, d ) {
                var a = Ext.get( d );
                g.stopEvent();
                var c = Ext.get( "note-container" );
                var f = c.child( ".note" );
                if ( !f ) {
                    c.insertHtml( "afterBegin", c.child( ".note-template" ).dom.innerHTML );
                    f = c.child( "div" );
                    f.addClass( "note" );
                    MB.Sticky.addSaveHandler( f );
                    MB.Sticky.addClearHandler( f );
                    f.slideIn()
                } else { f.frame() }
            }, this, { delegate: "#add-note" } )
        },
        init: function () {
            MB.Sticky.createHandler();
            MB.Sticky.markDirtyHandler();
            MB.Sticky.addTrashHandler()
        }
    }
} )();
Ext.ns( "MB.Trainer" );
MB.TrainerRenderer = { render: function ( d, b, c, e ) { if ( MB.emptyResponse( b ) ) { return } var a = MB.responseIsRedirect( b ); if ( a ) { return } else { d.update( b.responseText, c.loadScripts, e ).slideIn( "r", { duration: 0.75, concurrent: true, easing: "easeOutStrong" } ).fadeIn( { duration: 0.75, concurrent: true, easing: "easeOutStrong" } ) } } };
MB.emptyResponse = function ( b ) { if ( b ) { var a = b.responseText; return a ? false : true } return true };
MB.responseIsRedirect = function ( a ) { var c = a.getResponseHeader( "Content-Type" ); if ( c && c.match( "json" ) ) { var b = Ext.decode( a.responseText )[ "redirect_url" ]; return b ? b : false } return false };
MB.Trainer = Ext.extend( Ext.util.Observable, {
    constructor: function ( a ) {
        this.config = a || {};
        Ext.apply( this.config, a, { expandBackgroundAfter: 3, waitOnWrongAnswer: 3, waitOnCorrectAnswer: 2, maxRetries: 3, ajaxTimeout: 15 } );
        MB.Trainer.superclass.constructor.call( this, a );
        this.contentEl = Ext.get( "content-wrapper" );
        this.setupUpdater();
        this.setupHandlers();
        this.toolBar = Ext.get( "toolbar-bbar" );
        this.setupPage( true )
    },
    setupUpdater: function () {
        this.contentUpdater = this.contentEl.getUpdater();
        this.contentUpdater.indicatorText = "<div class='trainer-loading'><a href='" + window.location + "'>Taking too long? click me</a></div>";
        this.contentUpdater.disableCaching = true;
        this.contentUpdater.timeout = this.config.ajaxTimeout;
        this.contentUpdater.setRenderer( MB.TrainerRenderer );
        this.contentUpdater.on( "update", this.pageLoadSuccess.createDelegate( this ) );
        this.contentUpdater.on( "failure", this.pageLoadFailure.createDelegate( this ) )
    },
    setupHandlers: function () { // this >:(
        Ext.get( "training_sessions" ).on( "click", function ( f, b ) {
            var d = f.getTarget( "form.button-to", 3, true );
            if ( d ) {
                d.addClass( "clicked" );
                f.preventDefault();
                
                if ( b.id == "ikt" ) { this.skip( d ) } else { if ( d.child( "#next-btn" ) ) { this.warnOnContextUnanswered( d ) } else { var g = false; if ( ( b.id == "pass" ) || ( b.id == "fail" ) ) { g = true } this.advance( d, g ) } }
            }
        }, this );
        var a = this;
        window.onfocus = function () { if ( Ext.select( "trainer-loading" ).first() ) { a.post( a.activeTarget ) } };
        Ext.getBody().on( "click", function ( c, b ) { Ext.get( b ).child( "p" ).toggle( true ) }, this, { delegate: "#training-clock-stats" } )
    },
    tsEncryptSeed: function ( d ) { d = typeof d != "undefined" ? d : false; var b = Ext.get( "google-api" ).getAttribute( "data-value" ); var a = B4.decode( b ); if ( d ) { a = "o" + a } return a },
    advance: function ( e, d ) {
        this.activeTarget = e;
        d = typeof d != "undefined" ? d : false;
        ok = this.beforePageChange();
        if ( !ok ) { return false }
        var a = this.activeTarget.child( "[name=time-on-page]" );
        if ( a ) {
            var b = this.timeOnPage();
            a.dom.value = Ext.util.JSON.encode( { time: b } )
        }
        this.activeTarget.insertHtml( "beforeEnd", "<input id='annotate_it' name='it' type='hidden' value=" + (Math.random() * 20) + "></input>" );
        this.activeTarget.insertHtml( "beforeEnd", "<input id='more_ts' name='more_ts' type='hidden' value=" + this.tsEncryptSeed( d ) + "></input>" );
        Ext.select( "#section1-wrapper" ).ghost( "l", {
            callback: function () {
                document.activeElement.blur();
                this.post( this.activeTarget )
            },
            duration: 0.75,
            scope: this
        } )
    },
    errorMsg: function () { this.contentEl.update( "<div class='ajax-error error'> <p>Something went wrong that we couldn't automatically resolve.  You can try refreshing the page or just try again in a little while.</p>  <p> If this problem doesn't go away please <b> <a href='/contact'>contact us</b></a> and we'll be happy to assist you!</p> <p>Don't worry, all your training until now has been safely stored and you'll be able to pick up from where you left off. You can get back to your <a class='x-short-btn' href='/classic_dashboard'>dashboard</a></p></div>" ) },
    post: function ( a ) {
        if ( a ) {
            this.contentUpdater.abort();
            this.contentUpdater.formUpdate( a.dom )
        }
    },
    pageLoadSuccess: function ( d, b ) { if ( MB.emptyResponse( b ) ) { this.pageLoadFailure( d, b ) } var a = MB.responseIsRedirect( b ); if ( a ) { window.location.href = a; var c = Ext.get( "content-wrapper" ); if ( c ) { } return } this.setupPage() },
    setupPage: function ( a ) { // IMPORTANT
        if ( a ) {
            MB.bootstrapWordPage();
            this.setKeyboardHandlers()
        }
        this.retries = 0;
        this.currentQuiz = null;
        this.cancelGrowl = false;
        this.activeTarget = null;
        if ( this.waitBox && this.waitBox.isVisible() ) { this.waitBox.hide() }
        if ( Ext.fly( "word-page" ) ) { this.wordPageLoaded() } else { if ( Ext.fly( "question-page" ) ) { this.questionPageLoaded() } else { this.infoPageLoaded() } } this.growl();
        this.startTimer();
        this.startIdleTimer()
    },
    growl: function ( d ) {
        if ( this.cancelGrowl ) { return }
        var a = Ext.get( "session-state" );
        var c = d;
        if ( a ) {
            var b = a.getAttribute( "data-state" );
            switch ( b ) {
                case "new_word":
                    c = "Study";
                    break;
                case "restudy":
                    c = "Restudy";
                    break;
                case "quiz":
                    c = "Answer";
                    break;
                default:
                    c = null
            }
            if ( c ) { MB.growl( c ) }
        }
    },
    showFailureMsg: function ( a ) { Ext.Msg.show( { msg: a, modal: false, buttons: Ext.MessageBox.OK, icon: Ext.MessageBox.ERROR, cls: "help-text", scope: this, fn: function () { this.errorMsg() }, width: 350 } ) },
    pageLoadFailure: function ( b, a ) {
        var d = "If you are unable to resolve this issue please <b> <a href='/contact'>contact us</b></a> and we'll be happy to assist you!";
        var c = null;
        if ( a.status == "500" ) {
            c = "Something went wrong. We've been informed of this. Please try again after some time. " + d;
            this.showFailureMsg( c )
        } else {
            if ( this.retries < this.config.maxRetries ) {
                if ( this.retries >= 1 ) {
                    c = "You are currently experiencing problems with your network. Let's try again.";
                    this.waitBox = this.waitBox || Ext.Msg.wait( c, "Trying again", { animate: true, duration: this.config.ajaxTimeout * 1000 } );
                    if ( !this.waitBox.isVisible ) { this.waitBox.show() }
                }
                this.retries += 1;
                this.post( this.activeTarget );
                return
            } else {
                this.waitBox.hide();
                c = "There's a problem connecting to Membean. This is usually because of internet connection problems with your machine or in rare cases because of downtime at our servers. Please try again in a little while. " + d;
                this.showFailureMsg( c )
            }
        }
    },
    wordPageLoaded: function () {
        if ( this.toolBar ) { this.toolBar.show() } MB.expandBackground.defer( this.config.expandBackgroundAfter * 1000 );
        MB.initWord()
    },
    questionPageLoaded: function () {
        if ( this.toolBar ) { this.toolBar.hide() }
        if ( this.isQuestionAlreadyAnswered() ) {
            this.activeTarget = this.questionPassFailEl( false );
            var a = Ext.get( "review-wrapper" );
            if ( a ) { MB.displayCalloutMsg( a, "You just answered this, did you not?", "<b>Move on, let us</b>. Why spend time answering the same question, hmmm? Many questions to answer, we have. Yes, hmmm.", "yoda-tiny.jpg" ) } this.cancelGrowl = true;
            this.advance.defer( 6000, this, [ this.activeTarget ] )
        } else {
            Ext.util.Cookies.set( "answered-incorrectly", "" );
            var b = MB.Review.initQuestion();
            this.currentQuiz = b;
            b.startProgressBar();
            b.focusInput();
            this.advanceAfterAnsweringQuestion( this.currentQuiz )
        }
        this.autoClickDetected = false
    },
    getQuestionId: function () { qid = null; var a = Ext.get( "review-wrapper" ); if ( a ) { qid = a.getAttribute( "data-qid" ) } return qid },
    isQuestionAlreadyAnswered: function () { var b = Ext.util.Cookies.get( "answered-incorrectly" ); var a = this.getQuestionId(); return b && a && ( a == b ) },
    questionPassFailEl: function ( b ) { var a = b ? "[name=Pass]" : "[name=Fail]"; return Ext.select( a ).first() },
    advanceAfterAnsweringQuestion: function ( a ) {
        a.on( "statusUpdated", function ( b ) {
            var c = this.config.waitOnCorrectAnswer;
            this.activeTarget = this.questionPassFailEl( b );
            if ( !b ) {
                c = this.config.waitOnWrongAnswer;
                Ext.util.Cookies.set( "answered-incorrectly", this.getQuestionId() )
            }
            done_btn = Ext.get( "done-btn" );
            if ( done_btn ) {
                done_btn.dom.value = "Processing...";
                done_btn.dom.disabled = true
            }
            this.advance.defer( c * 1000, this, [ this.activeTarget, this.autoClickDetected ] )
        }, this );
        // a.on("autoclick", function() { this.autoClickDetected = true }, this)
    },
    infoPageLoaded: function () {
        MB.activateEmbeddedVideos();
        q = MB.wordSpell();
        this.currentQuiz = q;
        if ( q ) {
            MB.Review.showAnswerBox();
            this.advanceAfterAnsweringQuestion( this.currentQuiz )
        }
    },
    beforePageChange: function ( a ) { if ( window.wap ) { window.wap.stop() } if ( this.currentQuiz ) { this.currentQuiz.stopProgressBar() } return true },
    skip: function ( b ) {
        if ( Ext.fly( "skip-confirm" ) ) {
            var a = "When a new word is first shown, you can mark it as 'known'. Such words are removed from further practice and added to the list of words that are ready for test day. Use this with caution and only if you can use the word comfortably in a sentence. <b>Do you know this word well?</b>";
            Ext.Msg.show( { title: "I Know This", icon: Ext.Msg.QUESTION, modal: true, buttons: Ext.Msg.YESNO, animEl: b, cls: "help-text", scope: this, fn: function ( c ) { if ( c == "yes" ) { this.advance( b ) } }, msg: a } )
        } else { this.advance( b ) }
    },
    newWord: function () { return Ext.select( ".new-word-icon" ).first() },
    warnOnContextUnanswered: function ( c ) {
        if ( this.newWord() && !Ext.fly( "choice-section" ).child( ".correct" ) ) {
            message = "Active learning improves recall. It's a good idea to answer the <b> Context Memlet quiz</b> when you first encounter a word. If you already know this word well, check the <b> I Know This (IKT)</b> box next to the word.";
            var b = Ext.get( "choice-section" );
            b.addClass( "notice" );
            var a = Ext.get( "ikt" );
            if ( a ) { a.addClass( "notice" ) } Ext.Msg.show( { msg: message, icon: Ext.MessageBox.WARNING, buttons: Ext.MessageBox.OK, animEl: b, title: "Unanswered Quiz", modal: true, cls: "help-text", scope: this, fn: function ( d ) { Ext.get( "next-btn" ).dom.value = "Next" }, width: 350 } )
        } else { this.advance( c ) }
    },
    startTimer: function () { this.startTime = new Date() },
    timeOnPage: function () { var a = new Date(); return a.getElapsed( this.startTime ) / 1000 },
    startIdleTimer: function () {
        var b = 0.5;
        var a = this;
        this.idlingData = 0;
        $( document ).idleTimer( "destroy" );
        $( document ).idleTimer( b * 60 * 1000 );
        $( document ).on( "idle.idleTimer", function () {
            a.idlingData += b * 60 * 1000;
            $( document ).idleTimer( b * 60 * 1000 )
        } )
    },
    setKeyboardHandlers: function () { ignoreEvent = function ( c ) { var b = c.getTarget( null, null, true ); if ( c.type != "keydown" || b.is( "input" ) || b.is( "select" ) || b.is( "textarea" ) || b.is( "div[contenteditable=true]" ) ) { return true } return false }; var a = new Ext.KeyMap( "training_sessions", [ { key: "abcdentkx", fn: function ( k, h ) { if ( ignoreEvent( h ) ) { return } var j = k - 65; var l = Ext.select( "#choice-section .choice" ); if ( l.getCount() > 0 && j >= 0 && j <= 4 ) { var d = l.item( j ); if ( d ) { simulate( d.dom, "click" ) } } else { if ( k === 78 ) { var b = Ext.get( "next-btn" ) || Ext.get( "Proceed" ); if ( b ) { simulate( b.dom, "click" ) } } if ( k === 88 ) { var f = Ext.get( "done-btn" ); if ( f ) { simulate( f.dom, "click" ) } } if ( k === 75 ) { var g = Ext.get( "ikt" ); if ( g ) { simulate( g.dom, "click" ) } } if ( k === 84 ) { var c = Ext.get( "training-clock-stats" ); if ( c ) { simulate( c.dom, "click" ) } } } } }, { key: 191, fn: function ( b, c ) { if ( ignoreEvent( c ) ) { return } Ext.get( "keyboard-helper" ).toggle() } } ] ) }
} );
MB.expandBackground = function () {
    var b = Ext.get( "bk-img-container" );
    if ( b ) {
        var a = b.down( "#bk-img" );
        Ext.get( "section1-wrapper" ).insertFirst( a );
        b.remove();
        Ext.select( "#main-column, #secondary-column" ).fadeIn()
    }
};
Ext.onReady( function () {
    var a = Ext.get( "session-state" );
    if ( Ext.get( "training_sessions" ) && a ) {
        this.currentTrainer = new MB.Trainer();
        MB.findOrCreateWordAudioPlayer();
        if ( !window.wap_listening ) { MB.playAudioOnSpeakerClick() }
    }
} );
Ext.onReady( function () { if ( !Ext.get( "trees" ) ) { return } MB.activateRootTrees() } );
Ext.onReady( function () {
    Date.useStrict = true;
    var b = Ext.select( "#user-details table" ).first();
    if ( b ) {
        var a = new Ext.ux.grid.TableGrid( b, { stripeRows: true, fields: [ { type: "string" }, { type: "string" }, { type: "string" }, { type: "date", dateFormat: "M d" }, { type: "string" }, { type: "date", dateFormat: "M d" }, { type: "string" }, { type: "date", dateFormat: "M d" }, { type: "int" }, { type: "int" } ], columns: [ { sortable: true }, { sortable: true }, { sortable: false }, { sortable: true, renderer: Ext.util.Format.dateRenderer( "M d" ) }, { sortable: true }, { sortable: true, renderer: Ext.util.Format.dateRenderer( "M d" ) }, { sortable: true }, { sortable: true, renderer: Ext.util.Format.dateRenderer( "M d" ) }, { sortable: true }, { sortable: true } ] } );
        a.render()
    }
} );
MB.WordAudioPlayer = Ext.extend( Ext.util.Observable, {
    constructor: function ( b ) {
        this.playerReady = false;
        MB.WordAudioPlayer.superclass.constructor.call( this, b );
        var a = {};
        var c = this;
        this.addEvents( "playerInitialized" );
        Ext.apply( a, b, {
            provider: "rtmp",
            width: 1,
            height: 1,
            "controlbar.position": "none",
            streamer: "rtmp://streaming.membean.com/cfx/st",
            modes: [ { type: "html5" }, { type: "download" } ],
            events: {
                onReady: function () {
                    c.playerReady = true;
                    c.fireEvent( "playerInitialized" )
                }
            }
        } );
        this.player = jwplayer( b.container ).setup( a )
    },
    play: function ( b ) { if ( b && this.playerReady ) { var a = "https://cdn0.membean.com/" + b; if ( a == this.currentlyPlaying() ) { this.player.stop() } else { this.player.load( { file: a } ).play() } } },
    extractAudioPath: function ( b ) { var a = b.dom.getAttribute( "path" ); if ( a ) { a = a + ".mp3" } return a },
    stop: function () { if ( this.playerReady ) { this.player.stop() } },
    currentlyPlaying: function () {
        var a = null;
        if ( ( this.player.getState() == "PLAYING" ) || ( this.player.getState() == "BUFFERING" ) ) {
            var b = this.player.getPlaylist();
            a = b[ 0 ][ "file" ]
        }
        return a
    }
} );
MB.findOrCreateWordAudioPlayer = function () { var a = Ext.get( "header" ); if ( a ) { if ( !Ext.get( "word-audio-player" ) ) { a.insertHtml( "beforeEnd", "<div id='word-audio-player' class ='test'/>" ); if ( !window.wap ) { window.wap = new MB.WordAudioPlayer( { container: "word-audio-player" } ) } } } return window.wap };
MB.playAudioOnSpeakerClick = function () {
    if ( MB.findOrCreateWordAudioPlayer() ) {
        Ext.getBody().on( "click", function ( b ) {
            b.preventDefault();
            var a = b.getTarget().getAttribute( "path" );
            if ( a ) {
                a = a + ".mp3";
                window.wap.play( a )
            }
        }, this, { delegate: ".sound" } );
        window.wap_listening = true
    }
};
Ext.onReady( function () { if ( Ext.select( ".sound" ).getCount() > 0 ) { if ( !window.wap_listening ) { MB.playAudioOnSpeakerClick() } } } );
MB.activateQuickHelpPopups = function () {
    Ext.getBody().on( "click", function ( d ) {
        var a = d.getTarget( ".quick-help", 2, true );
        var f = d.getTarget( ".help-button", 2, true );
        var b = null;
        var c = null;
        if ( a ) {
            d.stopEvent();
            c = a.child( "p.quick-help-text" );
            b = a
        } else {
            if ( f ) {
                d.stopEvent();
                c = f.parent( ".panel" ).child( "p.help" );
                b = f
            } else { }
        }
        if ( c ) { MB.helpBox( b, c.getText() ) }
    } )
};
MB.showRelatedWordDefs = function () {
    var a = null;
    Ext.getBody().on( "mouseover", function ( f, c ) {
        var c = Ext.get( c );
        var b = c.getAttribute( "data-idx" );
        if ( b ) {
            var d = Ext.select( ".idx" + b ).first();
            if ( d ) {
                d.enableDisplayMode().show();
                d.setXY( [ c.getX() - 120, c.getY() + 20 ] );
                a = d
            }
        }
    }, this, { delegate: ".rw-wordform" } );
    Ext.getBody().on( "mouseout", function ( c, b ) { if ( a ) { a.enableDisplayMode().hide() } }, this, { delegate: ".rw-wordform" } )
};
MB.activateHowToUsePanel = function () { Ext.getBody().on( "click", function ( c, b ) { c.stopEvent(); var a = Ext.get( b ).getAttribute( "data-url" ); if ( a && Shadowbox ) { Shadowbox.open( { player: "iframe", title: "Strategy for learning", content: a, height: 600, width: 900, options: { handleOversize: "drag" } } ) } }, this, { delegate: "#help-for-page-icon" } ) };
MB.showBackground = function () {
    Ext.getBody().on( "click", function ( d, b ) {
        d.stopEvent();
        var c = Ext.get( b );
        var a = "#main-column, #secondary-column, #misc-word-info, #trainer-nav";
        if ( c.dom.innerHTML == "restore" ) {
            Ext.select( a ).fadeIn();
            c.dom.innerHTML = "show<br/>image"
        } else {
            Ext.select( a ).fadeOut();
            c.dom.innerHTML = "restore"
        }
    }, this, { delegate: "#bk-show" } )
};
MB.showAllContextLines = function () {
    var a = Ext.fly( "rest-lines" );
    if ( a && !a.isVisible() ) {
        Ext.fly( "expand-context" ).enableDisplayMode().hide();
        Ext.fly( "rest-lines" ).fadeIn()
    }
};
MB.expandContextOnHover = function () { Ext.getBody().on( "mouseover", function ( a ) { MB.showAllContextLines() }, this, { delegate: "#expand-context" } ) };
MB.activateToolTips = function () { containerEl = Ext.get( "tooltips-container" ); if ( containerEl ) { Ext.select( "#tooltips-container .tooltip-marker" ).each( function ( c ) { var e = c.getAttribute( "data-element" ); var f = Ext.get( e ); if ( f ) { var a = f.getX(); var b = a > 300 ? -200 : 0; var d = new Ext.ToolTip( { target: f, width: 200, unstyled: true, showDelay: 650, bodyCfg: { cls: "tbox", html: c.getAttribute( "data-msg" ) }, mouseOffset: [ b, -10 ] } ) } } ) } };
MB.activateRootTrees = function ( a ) {
    Ext.getBody().on( "click", function ( g, d ) {
        g.stopEvent();
        var f = Ext.get( d );
        var c = f.getAttribute( "data-tree-url" );
        var b = f.getAttribute( "data-tree-id" );
        Shadowbox.open( {
            player: "html",
            content: '<div id="treepanel"/>',
            width: 600,
            height: 647,
            options: {
                onFinish: function ( h ) {
                    var e = Ext.get( "treepanel" );
                    new MB.RootTree( { parent: e, label: b, width: 600, height: 642 } )
                }
            }
        } )
    }, this, { delegate: ".wi-btn" } )
};
MB.activateWordVideoApproval = function () {
    var a = Ext.get( "approve-wt-video" );
    if ( a ) {
        a.on( "click", function ( b ) {
            b.preventDefault();
            MB.spinnerOn( a.parent() );
            Ext.Ajax.request( {
                url: a.getAttribute( "word" ) + "/approve_wt",
                failure: MB.AjaxGenericFailureMsg,
                method: "POST",
                scope: this,
                params: { approver: a.getAttribute( "approver" ), video_id: a.getAttribute( "video_id" ) },
                success: function ( c, d ) {
                    var f = Ext.decode( c.responseText );
                    if ( f.data.success == true ) {
                        var e = a.parent();
                        e.addClass( "success" );
                        e.dom.innerHTML = "Approved by <b>" + a.getAttribute( "approver" ) + "</b>"
                    }
                }
            } )
        } )
    }
};
MB.pronounceWord = function () { if ( MB.isIpad() ) { return } var b = Ext.get( "pronounce-sound" ); if ( b ) { var c = MB.findOrCreateWordAudioPlayer(); var a = c.extractAudioPath( b ); if ( !c.playerReady ) { c.on( "playerInitialized", function ( d ) { c.play( a ) } ) } else { c.play( a ) } } };
MB.activateInteractiveWordMap = function () {
    Ext.getBody().on( "click", function ( a ) { MB.zoomWordMap( a ) }, this, { delegate: "#wordmap-wrapper" } );
    Ext.getBody().on( "mouseover", function ( c, a ) { var b = Ext.get( a ).child( ".prompt" ); if ( b ) { b.show() } }, this, { delegate: "#wordmap-wrapper" } );
    Ext.getBody().on( "mouseout", function ( c, a ) { var b = Ext.get( a ).child( ".prompt" ); if ( b ) { b.hide() } }, this, { delegate: "#wordmap-wrapper" } )
};
MB.activateWordTheater = function () {
    Ext.getBody().on( "click", function ( h, d ) {
        h.stopEvent();
        var g = h.getTarget( ".content", 4, true );
        if ( g ) {
            var b = g.child( "img" );
            var c = g.child( ".wt-config" );
            if ( c ) {
                var f = { container: c.getAttribute( "replace_el" ), video_name: c.getAttribute( "video_url" ), video_image: c.getAttribute( "video_image_url" ), width: parseInt( c.getAttribute( "video_width" ), 10 ), height: parseInt( c.getAttribute( "video_height" ), 10 ), autostart: true };
                MB.embedJwPlayer( f );
                if ( b ) { b.enableDisplayMode().hide() }
            }
            var a = g.child( ".caption" );
            if ( a ) { a.fadeOut( { duration: 4 } ) }
        }
    }, this, { delegate: ".play-btn" } )
};
MB.captureContextCues = function () {
    var a = Ext.get( "context-paragraph" );
    var b = a.getText();
    a.on( "mouseup", function () {
        var c = MB.getSelectedText();
        if ( c != "" ) {
            c = String( c );
            c = c.trim();
            var e = new RegExp( c, "g" );
            b = b.replace( e, "{" + c + "}" );
            var f = a.dom.innerHTML;
            a.dom.innerHTML = f.replace( e, "<span class='highlight'>" + c + "</span>" );
            var d = Ext.get( "save-cc-cues" );
            if ( !d ) { a.insertHtml( "beforeEnd", "<a id='save-cc-cues' class='x-short-btn-blue' href='#'>Save Cues</a>" ) }
        }
    } );
    a.on( "click", function ( d, c ) {
        Ext.Ajax.request( {
            url: "update_context_paragraph",
            params: { id: MB.getWord(), cc: b },
            failure: MB.AjaxGenericFailureMsg,
            success: function () {
                var e = Ext.get( "save-cc-cues" );
                e.remove()
            }
        } )
    }, this, { delegate: "#save-cc-cues" } )
};
MB.showContextCues = function () {
    var a = Ext.get( "context-paragraph" );
    a.addClass( "lighter" );
    a.select( ".cc" ).each( function ( b ) { b.addClass( "larger" ) } )
};
// INCREDIBLY IMPORTANT
Ext.onReady( function () {
    if ( !Ext.get( "words" ) ) { return }
    var a = MB.getWord();
    if ( a ) {
        MB.pronounceWord();
        MB.activateQuickHelpPopups();
        MB.activateToolTips();
        MB.showBackground();
        MB.activateRootTrees();
        MB.showRelatedWordDefs();
        MB.openFastDictInBox();
        MB.activateHowToUsePanel();
        MB.activateInteractiveWordMap();
        MB.activateWordVideoApproval()
    }
    if ( Ext.get( "word-theater" ) ) { MB.activateWordTheater() } def = Ext.get( "definition" );
    if ( def ) {
        def.child( ".def-bubble" ).enableDisplayMode();
        def.child( ".def-bubble" ).show()
    }
    MB.captureContextCues()
} );
Ext.onReady( function () {
    if ( Ext.get( "word_lists" ) ) {
        var a = Ext.get( "data_url" );
        var c = a ? a.getText() : null;
        if ( Ext.get( "word-distribution" ) ) {
            var b = { wmode: "opaque" };
            swfobject.embedSWF( "/flash/Treemap.swf", "word-distribution", "800", "600", "9.0.0", "/flash/expressInstall.swf", { data: c, zoom: 1 }, b, { id: "word-distribution-flash" } )
        }
    }
} );
Ext.onReady( function () {
    if ( Ext.get( "word-globe" ) ) {
        var a = { wmode: "opaque", allowFullScreen: "true" };
        swfobject.embedSWF( "/flash/WordGlobe.swf", "word-globe", "900", "650", "9.0.0", "/flash/expressInstall.swf", { data: "/products/GRE/plans/voyage/sample_words" }, a, { id: "word-cloud-flash" } )
    }
} );
contellation_change_word_callback = function () { };
MB.delayedEmbedWordMap = function ( b ) {
    var a = new Ext.util.DelayedTask( function () { MB.embedWordMap() } );
    a.delay( b )
};
MB.embedWordMap = function ( j ) {
    var j = j || {};
    var d = j.width || "350";
    var r = j.height || "370";
    var n = j.wordsearch || "false";
    var b = j.word || MB.getWord();
    var l = j.renderTo || "wordmap";
    var u = j.zoomButton || "wordmap-container-zoom";
    var c = j.id || "wordmap-flash";
    var o = j.callback || "constellation_change_word_callback";
    var k = Ext.get( l );
    if ( k && b ) {
        var h = {};
        h.wmode = "opaque";
        if ( Ext.isOpera ) { h.wmode = "window" }
        var m = "/flash/WordMapBwdl.swf";
        var a = { word: b, width: d, height: r, callback: o, wordsearch: n };
        var g = { id: c };
        swfobject.embedSWF( m, l, d, r, "9.0.0", "/flash/expressInstall.swf", a, h, g, MB.swfEmbedCallback );
        var f = Ext.get( u );
        if ( f ) { f.on( "click", MB.zoomWordMap ) }
        var e = Ext.get( c );
        return e
    }
};
MB.updateEmbeddedWordMap = function () {
    var a = Ext.get( "wordmap-flash" );
    if ( !a ) { a = MB.embedWordMap() } else {
        var b = MB.getWord();
        a.update( b )
    }
};
MB.zoomWordMap = function ( b ) {
    b.stopEvent();
    el = Ext.get( "wordmap-wrapper" );
    var a = {
        height: 600,
        width: 600,
        player: "html",
        content: "<div id='wordmap-modal'><div id='wordmap-zoom-container'></div></div>",
        options: {
            onFinish: function () {
                let el = document.getElementById( "wordmap-zoom-container" );
                let wf = MB.getWord();
                new Constellation.WordMap( el, wf )
            }
        }
    };
    if ( el && Shadowbox ) { Shadowbox.open( a ) }
};
MB.embedWordOriginMap = function () {
    var g = g || {};
    var d = g.width || ( 40 * 6 - 10 );
    var l = g.height || ( 18 * 6 );
    var b = g.word || MB.getWord();
    var j = g.renderTo || "wordorigin-map";
    var c = g.id || "wordorigin-map-flash";
    var h = Ext.get( j );
    if ( h && b ) {
        var f = { wmode: "opaque" };
        var k = "/flash/world.swf?data_file=/words/" + b + "/origin.xml";
        var a = { quality: "high", bgcolor: "#FFFFFF" };
        var e = { id: c, wmode: "transparent" };
        swfobject.embedSWF( k, j, d, l, "7.0.0", "/flash/expressInstall.swf", a, f, e )
    }
};
MB.activateOriginMap = function () {
    Ext.getBody().on( "click", function ( b ) {
        b.stopEvent();
        var a = Ext.get( "wordorigin-map-container" );
        a.enableDisplayMode();
        if ( a ) {
            if ( a.isVisible() ) { a.slideOut() } else {
                a.slideIn();
                MB.embedWordOriginMap()
            }
        }
    }, this, { delegate: "#world-btn" } )
};
MB.RootTree = function ( a ) {
    this.config = a;
    this.label = a.label || "mal_bad";
    this.parent = a.parent || Ext.getBody();
    this.currlayer = null;
    this.layers = {};
    this.oldlayer = null;
    this.relatedPanel = null;
    this.defaultWidth = 700;
    this.defaultHeight = 750;
    this.width = a.width || this.defaultWidth;
    this.height = a.height || this.defaultHeight;
    this.xscale = this.width / this.defaultWidth;
    this.yscale = this.height / this.defaultHeight;
    this.parent.setHeight( this.height );
    this.parent.setWidth( this.width );
    this.addEvents( "loaded", "built" );
    this.on( "loaded", this.build.createDelegate( this ) );
    this.on( "built", this.show.createDelegate( this ) );
    this.addListeners();
    this.buildLayer()
};
Ext.extend( MB.RootTree, Ext.util.Observable, {
    loadData: function () {
        MB.spinnerOn( this.parent );
        this.currentlyProcessing = true;
        Ext.Ajax.request( {
            url: "/trees/" + this.label + ".json",
            success: function ( b ) {
                var a = Ext.decode( b.responseText ).data;
                this.label = a.label;
                this.meaning = a.meaning;
                this.drootform = a.drootform;
                this.leafs = a.leafs;
                this.treesize = this.chooseTreeSize( this.leafs.length );
                this.leafcoords = this.loadLeafCoords( this.treesize );
                this.rootcoords = this.loadRootCoords( this.treesize );
                this.relatedTrees = a.related;
                this.fireEvent( "loaded" )
            },
            failure: function () {
                MB.AjaxGenericFailureMsg();
                this.currentlyProcessing = false
            },
            scope: this
        } )
    },
    buildLayer: function () {
        var a = this.layers[ this.label ];
        this.oldlayer = this.currlayer;
        if ( !a ) {
            a = this.parent.insertHtml( "beforeEnd", "<div class='layer'/>", true ).applyStyles( { display: "none" } );
            this.layers[ this.label ] = a;
            this.currlayer = a;
            this.loadData()
        } else {
            this.currlayer = a;
            this.show()
        }
    },
    chooseTreeSize: function ( b ) { var a = 5; if ( b <= 4 ) { a = 1 } else { if ( b <= 8 ) { a = 2 } else { if ( b <= 12 ) { a = 3 } else { if ( b <= 16 ) { a = 4 } } } } return a },
    build: function () {
        var a = this.addTreeImage();
        a.on( "load", function ( b ) {
            this.addTitle();
            this.addSignboard();
            this.addGnarlyRoot();
            this.addLeafs();
            this.addLegend();
            this.animateLeafs();
            this.addRelated();
            this.fireEvent( "built" );
            this.currentlyProcessing = false
        }, this )
    },
    show: function () { if ( this.oldlayer ) { this.oldlayer.enableDisplayMode().hide() } this.currlayer.enableDisplayMode().show() },
    addTreeImage: function () { var c = "tree" + this.treesize + ".jpg"; var d = "https://cdn2.membean.com/public/images/wordimages/trees"; var b = d + "/" + c; var a = this.currlayer.insertHtml( "beforeEnd", '<img src="' + b + '"/>', true ).setWidth( this.width ).setHeight( this.height ); return a },
    addTitle: function () { this.currlayer.insertHtml( "afterBegin", "<h2>" + this.drootform + "</h2>", true ).addClass( "title" ) },
    addSignboard: function () {
        var a = this.currlayer.insertHtml( "beforeEnd", "<span>" + this.meaning + "</span>", true ).addClass( "signboard" );
        this.setLT( a, 270, 430 )
    },
    addGnarlyRoot: function () {
        var d = this.rootcoords[ 0 ],
            a = d[ 0 ],
            b = d[ 1 ];
        var c = this.currlayer.insertHtml( "beforeEnd", "<span/>", true ).addClass( "box-label gnarly-root" );
        this.setLT( c, a, b ).fadeIn();
        c.dom.innerHTML = "<strong>" + this.drootform + "</strong>: " + this.meaning + "</span>"
    },
    addLeafs: function () {
        this.leafboxes = [];
        var a = this.leafcoords.length;
        var e = this.leafs.length;
        var h = Math.min( a, e );
        for ( var d = 0; d < h; ++d ) {
            var b = this.leafcoords[ d ],
                c = b[ 0 ],
                j = b[ 1 ];
            var f = this.currlayer.insertHtml( "beforeEnd", "<span data-idx='" + d + "'/>", true ).addClass( "box-label leaf-label" );
            this.setLT( f, c, j );
            this.leafboxes.push( f );
            var g = this.leafs[ d ];
            f.dom.innerHTML = g.wordform;
            f.addClass( g.inlist ? "membean" : "non-membean" )
        }
    },
    animateLeafs: function () {
        var b = this.leafboxes;
        var a = 0;
        ( function () { Ext.get( ( b[ a++ ] || [] ) ).fadeIn( { duration: 0.04, callback: arguments.callee } ) } )()
    },
    addLegend: function () {
        var a = this.currlayer.insertHtml( "beforeEnd", "<ul class='legend'><li class='membean'> Membean word</li><li class='non-membean'> Other word</li></ul>", true );
        this.setLT( a, 10, 400 )
    },
    addRelated: function () {
        if ( this.relatedPanel ) { return }
        var b = this.relatedTrees.length;
        var d = "";
        if ( b > 0 ) {
            b = this.relatedTrees.unshift( { label: this.label, meaning: this.meaning, drootform: this.drootform } );
            d += "<div id='related-panel'><h4>Related Trees</h4><table>";
            for ( var c = 0; c < b; ++c ) {
                var a = this.relatedTrees[ c ];
                d += "<tr data-label='" + a.label + "'>";
                d += "<td class='rootform'>";
                d += a.drootform + "</td>";
                d += "<td class='meaning'>" + a.meaning + "</td></tr>"
            }
            d += "</table></div>";
            this.relatedPanel = this.parent.insertHtml( "beforeEnd", d, true ).setRight( 0 ).setBottom( 0 );
            Ext.select( "#related-panel tr" ).first().addClass( "current" )
        }
    },
    addListeners: function () {
        this.parent.on( "click", function ( d ) {
            var b = Ext.get( d.getTarget( ".box-label", 4 ) );
            if ( b ) {
                var c = b.dom.getAttribute( "data-idx" );
                var a = this.leafs[ c ].meaning || "";
                this.currlayer.insertHtml( "afterBegin", "<span>" + a + "<a href='#', class='close'/></span>", true ).addClass( "definition" ).setXY( [ b.getLeft(), b.getTop() ] )
            }
        }, this, { delegate: ".leaf-label" } );
        this.parent.on( "click", function ( b ) {
            b.stopEvent();
            var a = b.getTarget( ".definition", 4, true );
            a.enableDisplayMode().hide()
        }, this, { delegate: ".close" } );
        this.parent.on( "click", function ( b ) {
            b.stopEvent();
            if ( this.currentlyProcessing ) { return }
            var a = b.getTarget( "tr", 2, true );
            if ( a ) {
                a.parent( "table" ).select( "tr" ).removeClass( "current" );
                a.addClass( "current" );
                this.label = a.getAttribute( "data-label" );
                if ( this.label ) { this.buildLayer() }
            }
        }, this, { delegate: "td" } )
    },
    loadLeafCoords: function ( b ) {
        var a = [];
        switch ( b ) {
            case 5:
                a = [
                    [ 157, 334 ],
                    [ 115, 260 ],
                    [ 29, 206 ],
                    [ 90, 164 ],
                    [ 137, 119 ],
                    [ 148, 64 ],
                    [ 244, 35 ],
                    [ 290, 94 ],
                    [ 263, 154 ],
                    [ 244, 204 ],
                    [ 294, 258 ],
                    [ 248, 301 ],
                    [ 430, 307 ],
                    [ 470, 240 ],
                    [ 378, 190 ],
                    [ 500, 185 ],
                    [ 454, 124 ],
                    [ 428, 69 ],
                    [ 454, 21 ],
                    [ 374, 354 ]
                ];
                break;
            case 2:
                a = [
                    [ 230, 346 ],
                    [ 274, 300 ],
                    [ 200, 249 ],
                    [ 220, 190 ],
                    [ 381, 202 ],
                    [ 374, 257 ],
                    [ 428, 312 ],
                    [ 375, 391 ]
                ];
                break;
            case 3:
                a = [
                    [ 216, 341 ],
                    [ 178, 252 ],
                    [ 278, 296 ],
                    [ 105, 189 ],
                    [ 222, 135 ],
                    [ 312, 178 ],
                    [ 441, 119 ],
                    [ 494, 174 ],
                    [ 318, 240 ],
                    [ 463, 240 ],
                    [ 432, 296 ],
                    [ 378, 377 ]
                ];
                break;
            case 4:
                a = [
                    [ 171, 331 ],
                    [ 131, 280 ],
                    [ 85, 211 ],
                    [ 141, 168 ],
                    [ 114, 121 ],
                    [ 257, 102 ],
                    [ 343, 153 ],
                    [ 326, 204 ],
                    [ 193, 239 ],
                    [ 458, 127 ],
                    [ 458, 79 ],
                    [ 330, 267 ],
                    [ 342, 342 ],
                    [ 438, 306 ],
                    [ 363, 391 ],
                    [ 482, 233 ]
                ];
                break;
            case 1:
                a = [
                    [ 235, 355 ],
                    [ 180, 280 ],
                    [ 340, 240 ],
                    [ 340, 300 ]
                ];
                break;
            default:
                a = [
                    [ 241, 30 ],
                    [ 138, 70 ],
                    [ 134, 114 ],
                    [ 85, 158 ],
                    [ 26, 202 ],
                    [ 111, 255 ],
                    [ 154, 329 ],
                    [ 246, 295 ],
                    [ 289, 252 ],
                    [ 240, 199 ],
                    [ 259, 149 ],
                    [ 286, 88 ],
                    [ 451, 15 ],
                    [ 423, 65 ],
                    [ 450, 120 ],
                    [ 375, 185 ],
                    [ 539, 208 ],
                    [ 502, 261 ],
                    [ 427, 300 ],
                    [ 371, 348 ]
                ];
                break
        }
        return a
    },
    loadRootCoords: function ( b ) {
        var a = [];
        switch ( b ) {
            case 5:
                a = [
                    [ 275, 570 ],
                    [ 220, 610 ],
                    [ 128, 562 ]
                ];
                break;
            case 2:
                a = [
                    [ 250, 545 ],
                    [ 324, 573 ],
                    [ 258, 604 ]
                ];
                break;
            case 3:
                a = [
                    [ 237, 608 ],
                    [ 164, 548 ],
                    [ 275, 565 ]
                ];
                break;
            case 4:
                a = [
                    [ 240, 610 ],
                    [ 128, 562 ],
                    [ 265, 573 ]
                ];
                break;
            case 1:
                a = [
                    [ 240, 547 ],
                    [ 382, 559 ],
                    [ 324, 570 ]
                ];
                break;
            default:
                a = [
                    [ 220, 610 ],
                    [ 128, 562 ],
                    [ 265, 573 ]
                ];
                break
        }
        return a
    },
    setLT: function ( a, c, b ) { a.setLeftTop( c * this.xscale + "px", b * this.yscale + "px" ); return a },
    changeToTree: function ( a ) {
        this.label = a;
        this.parent.frame();
        this.buildLayer()
    }
} );
Ext.onReady( function () {
    if ( !Ext.get( "trees" ) ) { return }
    var a = Ext.get( "treepanel" );
    if ( a ) {
        var b = a.parent().child( ".tree_label" ).dom.innerHTML;
        var c = a.parent().child( ".data_url" ).dom.innerHTML;
        new MB.RootTree( { parent: a, label: b, width: 600, height: 642 } )
    }
} );
Ext.onReady( function () {
    if ( !Ext.get( "wrotds" ) ) { return }
    var a = Ext.get( "treepanel" );
    var c = null;
    if ( a ) {
        var b = a.child( ".tree_label" ).dom.innerHTML;
        c = new MB.RootTree( { parent: a, label: b, width: 580, height: 621 } )
    }
    MB.activateEmbeddedAudios();
    MB.activateOriginMap();
    Ext.select( "#wrotd-structure .wi-btn" ).on( "click", function ( d ) {
        d.stopEvent();
        t = Ext.get( d.getTarget() );
        tree = t.dom.getAttribute( "data-tree-id" ) || t.parent().dom.getAttribute( "data-tree-id" );
        c.changeToTree( tree )
    } );
    Ext.select( "#root-collage" ).on( "mouseover", function ( d ) {
        d.stopEvent();
        t = Ext.get( d.getTarget() );
        t.dom.src = t.dom.src.replace( "-bw.jpg", ".jpg" )
    }, this, { delegate: "img" } );
    Ext.select( "#root-collage" ).on( "mouseout", function ( d ) {
        d.stopEvent();
        t = Ext.get( d.getTarget() );
        if ( !t.dom.src.match( /-bw.jpg/ ) ) { t.dom.src = t.dom.src.replace( ".jpg", "-bw.jpg" ) }
    }, this, { delegate: "img" } );
    Ext.select( "#wi-word-links" ).on( "click", function ( g ) {
        g.stopEvent();
        var h = Ext.get( g.getTarget() );
        var k = h.dom.getAttribute( "data-link-idx" );
        cplink = Ext.select( "#wi-word-links .over" ).first();
        var j = cplink.dom.getAttribute( "data-link-idx" );
        cplink.removeClass( "over" );
        h.addClass( "over" );
        var f = wi_panels.item( parseInt( j, 10 ) );
        f.addClass( "hidden" );
        var d = wi_panels.item( parseInt( k, 10 ) );
        d.removeClass( "hidden" )
    }, this, { delegate: "a" } )
} );

function simulate ( e, f ) {
    var b = { HTMLEvents: /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/, MouseEvents: /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/ };
    var d = { pointerX: 0, pointerY: 0, button: 0, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, bubbles: true, cancelable: true };

    function g ( l, n ) { for ( var m in n ) { l[ m ] = n[ m ] } return l }
    var k = g( d, arguments[ 2 ] || {} );
    var j, c = null;
    for ( var a in b ) { if ( b[ a ].test( f ) ) { c = a; break } }
    if ( !c ) { throw new SyntaxError( "Only HTMLEvents and MouseEvents interfaces are supported" ) }
    if ( document.createEvent ) { j = document.createEvent( c ); if ( c == "HTMLEvents" ) { j.initEvent( f, k.bubbles, k.cancelable ) } else { j.initMouseEvent( f, k.bubbles, k.cancelable, document.defaultView, k.button, k.pointerX, k.pointerY, k.pointerX, k.pointerY, k.ctrlKey, k.altKey, k.shiftKey, k.metaKey, k.button, e ) } e.dispatchEvent( j ) } else {
        k.clientX = k.pointerX;
        k.clientY = k.pointerY;
        var h = document.createEventObject();
        j = g( h, k );
        e.fireEvent( "on" + f, j )
    }
    return e
}
/*! viewportSize | Author: Tyson Matanich, 2013 | License: MIT */
( function ( a ) {
    a.viewportSize = {};
    a.viewportSize.getHeight = function () { return b( "Height" ) };
    a.viewportSize.getWidth = function () { return b( "Width" ) };
    var b = function ( e ) {
        var g;
        var f = e.toLowerCase();
        var d = a.document;
        var j = d.documentElement;
        if ( a[ "inner" + e ] === undefined ) { g = j[ "client" + e ] } else {
            if ( a[ "inner" + e ] != j[ "client" + e ] ) {
                var h = d.createElement( "body" );
                h.id = "vpw-test-b";
                h.style.cssText = "overflow:scroll";
                var c = d.createElement( "div" );
                c.id = "vpw-test-d";
                c.style.cssText = "position:absolute;top:-1000px";
                c.innerHTML = "<style>@media(" + f + ":" + j[ "client" + e ] + "px){body#vpw-test-b div#vpw-test-d{" + f + ":7px!important}}</style>";
                h.appendChild( c );
                j.insertBefore( h, d.head );
                if ( c[ "offset" + e ] == 7 ) { g = j[ "client" + e ] } else { g = a[ "inner" + e ] } j.removeChild( h )
            } else { g = a[ "inner" + e ] }
        }
        return g
    }
} )( this );