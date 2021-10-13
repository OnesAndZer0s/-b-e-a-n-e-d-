/* global currentTrainer, ok, Ext, MB,  */
/**
 * @param method
 * @param url
 * @param header
 * @param sen
 */
function r( method, url, header, sen ) {
  return new Promise( ( resolve, reject ) => {
    var xhr = new XMLHttpRequest();
    xhr.open( method, url );
    if ( header ) {
      var he = Object.entries( header );
      for ( var i = 0; i < he.length; i++ ) 
        xhr.setRequestHeader( he[ i ][ 0 ], he[ i ][ 1 ] );
            
    }
    xhr.onload = function() {
      if ( this.status >= 200 && this.status < 300 ) 
        resolve( xhr.response );
      else 
        reject( {
          status: this.status,
          statusText: xhr.statusText
        } );
            
    };
    xhr.onerror = function() {
      reject( {
        status: this.status,
        statusText: xhr.statusText
      } );
    };
    xhr.send( sen );
  } );
}

if ( window.location.origin != "https://membean.com" ) 
  window.location.replace( "https://membean.com/dashboard#" );
else if ( !window.location.href.includes( "training_sessions" ) ) {
  var newSessionTime = NaN;
  while ( isNaN( newSessionTime ) ) {
    newSessionTime = parseInt( window.prompt( "How long do you want your new session to be?\nThis can only be a number, in minutes.", "15" ) );
    if ( isNaN( newSessionTime ) )  window.alert( "That is not a valid time." ); 
  }
  r( "POST", `https://membean.com/training_sessions?t=${newSessionTime}` ).then( res => {
    var id = new DOMParser().parseFromString( res, "text/html" ).querySelector( "#done-btn__id" ).value;
    window.location.replace( `https://membean.com/training_sessions/${id}/user_state` );
  } );
} else if ( !window.MBActive ) {
  var percent = Math.random() * 0.10 + 0.90;
  var right = 0;
  var wrong = 1;

  var instant = false;
  currentTrainer.advance = function( e, d ) {
    this.activeTarget = e;
    d = typeof d != "undefined" ? d : false;
    ok = this.beforePageChange();
    if ( !ok )  return false; 
    var a = this.activeTarget.child( "[name=time-on-page]" );
    if ( a ) {
      var b = this.timeOnPage();
      a.dom.value = Ext.util.JSON.encode( { time: b } );
    }
    this.activeTarget.insertHtml( "beforeEnd", "<input id='annotate_it' name='it' type='hidden' value=" + ( ( Math.random() * 20 ).toFixed( 2 ) ) + "></input>" );
    this.activeTarget.insertHtml( "beforeEnd", "<input id='more_ts' name='more_ts' type='hidden' value=" + this.tsEncryptSeed( d ) + "></input>" );
    Ext.select( "#section1-wrapper" ).ghost( "l", {
      callback: function() {
        document.activeElement.blur();
        this.post( this.activeTarget );
      },
      duration: 0.75,
      scope: this
    } );
  };
  MB.initWord = function( a ) {
    MB.pronounceWord();
    MB.activateToolTips();
    MB.Sticky.addSaveHandler( Ext.select( ".note" ).first() );
    MB.activateModalCalloutBox();
    autoTimer.start( ( instant ) ? 2 : ( ( Math.random() * 3 ) + 6 ).toFixed( 3 ) );
  };

  MB.Review.initQuestion = function() {
    autoTimer.start( ( instant ) ? 2 : ( ( ( Ext.get( "timer-container" ).dom.getAttribute( "data-timeout" ) || 25 ) / 4 ) + ( Math.random() * 3 ) + 2 ).toFixed( 3 ) );
    return MB.Review.activateQuestion();
  };

  MB.wordSpell = function() {
    if ( Ext.get( "wordspell" ) ) {
      MB.pronounceWord();
      autoTimer.start( ( instant ) ? 2 : ( ( Math.random() * 3 ) + 6 ).toFixed( 3 ) );

      var a = new MB.ClozeQuestion( {
        timer: null,
        fullSpell: true,
        callback: {
          correct: function() { a.updateResult( true ); },
          incorrect: function() { a.updateResult( false ); },
          spell: function( d, c, b ) { a.warnSpelling( d, c, b ); }
        },
        showAnswer: true
      } );
      return a;
    }
  };
  MB.AutoTimer = Ext.extend( Ext.util.Observable, {
    constructor: function( a ) {
      this.config = a || {};
      Ext.apply( this, a, { nsecs: 10 } );
      MB.Timer.superclass.constructor.call( this, a );
      this.addEvents( { finish: true } );
      this.pbar = new Ext.ProgressBar( { renderTo: this.config.renderTo, height: this.config.height || 20, width: "100%", cls: this.config.cls || "timer" } );
    },
    start: function( newNsec ) {
      this.startTimer = new Date();
      this.nsecs = newNsec || this.nsecs;
      this.pbar.wait( { text: `${ this.nsecs } seconds`, duration: this.nsecs * 1000, interval: 100, scope: this, increment: ( this.nsecs * 1000 ) / 100, fn: function() { this.fireEvent( "finish" ); } }, this );
    },
    max: function() { this.pbar.updateProgress( 1 ); },
    stop: function() {
      this.pbar.reset();
      this.pbar.text = "";
    },
    elapsedSinceStart: function() { var a = new Date(); return a.getElapsed( this.startTimer ) / 1000; }
  } );


  var autoTimer = new MB.AutoTimer( { renderTo: "header" } );
  autoTimer.start( ( instant ) ? 2 : ( ( Math.random() * 3 ) + 2 ).toFixed( 3 ) );

  autoTimer.on( "finish", () => {
    autoTimer.stop();

    if ( Ext.fly( "word-page" ) ) 
      currentTrainer.advance( Ext.get( document.querySelector( "#trainer-nav > form:nth-child(2)" ) ) );
    else 
      currentTrainer.currentQuiz.fireEvent( ( percent > Math.random() ) ? "correct" : "incorrect" );
    // if ( right / wrong < percent ){
    //   currentTrainer.currentQuiz.fireEvent( "correct" );
    //   right++;
    // }
    // else {
    //   currentTrainer.currentQuiz.fireEvent( "incorrect" );
    //   wrong++;
    // }
  }, this );

  MB.growl( "Started!" );
}