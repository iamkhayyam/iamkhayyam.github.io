/*
 * iamkhayyam.xyz — shader footer
 * Renders Reinder Nijhoff's "A lot of spheres" (Shadertoy /view/lsX3WH,
 * CC BY-NC-SA 4.0) as a monochromatic WebGL2 footer.
 * Loaded by index.html and every subpage.
 *
 * Perf:
 *  - DPR clamped to 1.5
 *  - IntersectionObserver pauses rAF when off-screen
 *  - prefers-reduced-motion renders a single static frame
 */
(function () {
  var canvas = document.getElementById('shaderCanvas');
  if (!canvas) return;

  var gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    powerPreference: 'low-power'
  });
  if (!gl) return; // no WebGL2 — leave the fallback markup showing

  // Original shader by Reinder Nijhoff (@reindernijhoff) — CC BY-NC-SA 4.0
  // https://www.shadertoy.com/view/lsX3WH
  // Modified only to inject one line of luminance desaturation before
  // vignetting so the output is monochrome.
  var SHADER = [
    '#define SHADOW',
    '#define REFLECTION',
    '#define RAYCASTSTEPS 40',
    '#define EPSILON 0.0001',
    '#define MAXDISTANCE 400.',
    '#define GRIDSIZE 8.',
    '#define GRIDSIZESMALL 5.',
    '#define MAXHEIGHT 30.',
    '#define SPEED 0.5',
    '#define time iTime',
    '',
    'const mat2 mr = mat2 (0.84147,  0.54030, 0.54030, -0.84147 );',
    'float hash( float n ) { return fract(sin(n)*43758.5453); }',
    'vec2 hash2( float n ) { return fract(sin(vec2(n,n+1.0))*vec2(2.1459123,3.3490423)); }',
    'vec2 hash2( vec2 n ) { return fract(sin(vec2( n.x*n.y, n.x+n.y))*vec2(2.1459123,3.3490423)); }',
    'vec3 hash3( float n ) { return fract(sin(vec3(n,n+1.0,n+2.0))*vec3(3.5453123,4.1459123,1.3490423)); }',
    'vec3 hash3( vec2 n ) { return fract(sin(vec3(n.x, n.y, n+2.0))*vec3(3.5453123,4.1459123,1.3490423)); }',
    '',
    'bool intersectPlane(vec3 ro, vec3 rd, float height, out float dist) {',
    '  if (rd.y==0.0) return false;',
    '  float d = -(ro.y - height)/rd.y;',
    '  d = min(100000.0, d);',
    '  if( d > 0. ) { dist = d; return true; }',
    '  return false;',
    '}',
    '',
    'bool intersectUnitSphere ( in vec3 ro, in vec3 rd, in vec3 sph, out float dist, out vec3 normal ) {',
    '  vec3  ds = ro - sph;',
    '  float bs = dot( rd, ds );',
    '  float cs = dot(  ds, ds ) - 1.0;',
    '  float ts = bs*bs - cs;',
    '  if( ts > 0.0 ) {',
    '    ts = -bs - sqrt( ts );',
    '    if( ts>0. ) { normal = normalize( (ro+ts*rd)-sph ); dist = ts; return true; }',
    '  }',
    '  return false;',
    '}',
    '',
    'void getSphereOffset( vec2 grid, inout vec2 center ) {',
    '  center = (hash2( grid+vec2(43.12,1.23) ) - vec2(0.5) )*(GRIDSIZESMALL);',
    '}',
    'void getMovingSpherePosition( vec2 grid, vec2 sphereOffset, inout vec3 center ) {',
    '  float s = 0.1+hash( grid.x*1.23114+5.342+74.324231*grid.y );',
    '  float t = fract(14.*s + time/s*.3);',
    '  float y =  s * MAXHEIGHT * abs( 4.*t*(1.-t) );',
    '  vec2 offset = grid + sphereOffset;',
    '  center = vec3( offset.x, y, offset.y ) + 0.5*vec3( GRIDSIZE, 2., GRIDSIZE );',
    '}',
    'void getSpherePosition( vec2 grid, vec2 sphereOffset, inout vec3 center ) {',
    '  vec2 offset = grid + sphereOffset;',
    '  center = vec3( offset.x, 0., offset.y ) + 0.5*vec3( GRIDSIZE, 2., GRIDSIZE );',
    '}',
    'vec3 getSphereColor( vec2 grid ) {',
    '  return normalize( hash3( grid+vec2(43.12*grid.y,12.23*grid.x) ) );',
    '}',
    '',
    'vec3 trace(vec3 ro, vec3 rd, out vec3 intersection, out vec3 normal, out float dist, out int material) {',
    '  material = 0;',
    '  dist = MAXDISTANCE;',
    '  float distcheck;',
    '  vec3 sphereCenter, col, normalcheck;',
    '  if( intersectPlane( ro,  rd, 0., distcheck) && distcheck < MAXDISTANCE ) {',
    '    dist = distcheck; material = 1; normal = vec3( 0., 1., 0. ); col = vec3( 0.25 );',
    '  } else { col = vec3( 0. ); }',
    '  vec3 pos = floor(ro/GRIDSIZE)*GRIDSIZE;',
    '  vec3 ri = 1.0/rd;',
    '  vec3 rs = sign(rd) * GRIDSIZE;',
    '  vec3 dis = (pos-ro + 0.5  * GRIDSIZE + rs*0.5) * ri;',
    '  vec3 mm = vec3(0.0);',
    '  vec2 offset;',
    '  for( int i=0; i<RAYCASTSTEPS; i++ ) {',
    '    if( material > 1 || distance( ro.xz, pos.xz ) > dist+GRIDSIZE ) break;',
    '    vec2 offset;',
    '    getSphereOffset( pos.xz, offset );',
    '    getMovingSpherePosition( pos.xz, -offset, sphereCenter );',
    '    if( intersectUnitSphere( ro, rd, sphereCenter, distcheck, normalcheck ) && distcheck < dist ) {',
    '      dist = distcheck; normal = normalcheck; material = 2;',
    '    }',
    '    getSpherePosition( pos.xz, offset, sphereCenter );',
    '    if( intersectUnitSphere( ro, rd, sphereCenter, distcheck, normalcheck ) && distcheck < dist ) {',
    '      dist = distcheck; normal = normalcheck; col = getSphereColor( offset ); material = 3;',
    '    }',
    '    mm = step(dis.xyz, dis.zyx);',
    '    dis += mm * rs * ri;',
    '    pos += mm * rs;',
    '  }',
    '  vec3 color = vec3( 0. );',
    '  if( material > 0 ) {',
    '    intersection = ro + rd*dist;',
    '    vec2 map = floor(intersection.xz/GRIDSIZE)*GRIDSIZE;',
    '    if( material == 1 || material == 3 ) {',
    '      vec3 c = vec3( -GRIDSIZE,0., GRIDSIZE );',
    '      for( int x=0; x<3; x++ ) {',
    '        for( int y=0; y<3; y++ ) {',
    '          vec2 mapoffset = map+vec2( c[x], c[y] );',
    '          vec2 offset;',
    '          getSphereOffset( mapoffset, offset );',
    '          vec3 lcolor = getSphereColor( mapoffset );',
    '          vec3 lpos;',
    '          getMovingSpherePosition( mapoffset, -offset, lpos );',
    '          float shadow = 1.;',
    '#ifdef SHADOW',
    '          if( material == 1 ) {',
    '            for( int sx=0; sx<3; sx++ ) {',
    '              for( int sy=0; sy<3; sy++ ) {',
    '                if( shadow < 1. ) continue;',
    '                vec2 smapoffset = map+vec2( c[sx], c[sy] );',
    '                vec2 soffset;',
    '                getSphereOffset( smapoffset, soffset );',
    '                vec3 slpos, sn;',
    '                getSpherePosition( smapoffset, soffset, slpos );',
    '                float sd;',
    '                if( intersectUnitSphere( intersection, normalize( lpos - intersection ), slpos, sd, sn )  ) {',
    '                  shadow = 0.;',
    '                }',
    '              }',
    '            }',
    '          }',
    '#endif',
    '          color += col * lcolor * ( shadow * max( dot( normalize(lpos-intersection), normal ), 0.) *',
    '                                   clamp(10. / dot( lpos - intersection, lpos - intersection) - 0.075, 0., 1.)  );',
    '        }',
    '      }',
    '    } else {',
    '      color = (3.+2.*dot(normal, vec3( 0.5, 0.5, -0.5))) * getSphereColor( map );',
    '    }',
    '  }',
    '  return color;',
    '}',
    '',
    'void mainImage( out vec4 fragColor, in vec2 fragCoord ) {',
    '  vec2 q = fragCoord.xy/iResolution.xy;',
    '  vec2 p = -1.0+2.0*q;',
    '  p.x *= iResolution.x/iResolution.y;',
    '  vec3 ce = vec3( cos( 0.232*time) * 10., 6.+3.*cos(0.3*time), GRIDSIZE*(time/SPEED) );',
    '  vec3 ro = ce;',
    '  vec3 ta = ro + vec3( -sin( 0.232*time) * 10., -2.0+cos(0.23*time), 10.0 );',
    '  float roll = -0.15*sin(0.5*time);',
    '  vec3 cw = normalize( ta-ro );',
    '  vec3 cp = vec3( sin(roll), cos(roll),0.0 );',
    '  vec3 cu = normalize( cross(cw,cp) );',
    '  vec3 cv = normalize( cross(cu,cw) );',
    '  vec3 rd = normalize( p.x*cu + p.y*cv + 1.5*cw );',
    '  int material;',
    '  vec3 normal, intersection;',
    '  float dist;',
    '  vec3 col = trace(ro, rd, intersection, normal, dist, material);',
    '#ifdef REFLECTION',
    '  if( material > 0 ) {',
    '    float f = 0.04 * clamp(pow(1. + dot(rd, normal), 5.), 0., 1.);',
    '    vec3 ro = intersection + EPSILON*normal;',
    '    rd = reflect( rd, normal );',
    '    vec3 refColor = trace(ro, rd, intersection, normal, dist, material);',
    '    if (material > 2) { col += .5 * refColor; }',
    '    else { col += f * refColor; }',
    '  }',
    '#endif',
    '  col = pow( col * .5, vec3(1./2.2) );',
    '  col = clamp(col, 0.0, 1.0);',
    '  /* MONOCHROMIZE — luminance-weighted desaturation before vignette */',
    '  float _lum = dot(col, vec3(0.2126, 0.7152, 0.0722));',
    '  col = vec3(_lum);',
    '  col *= 0.25+0.75*pow( 16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y), 0.15 );',
    '  fragColor = vec4( col,1.0);',
    '}'
  ].join('\n');

  var VERT = '#version 300 es\n' +
    'in vec2 aPos;\n' +
    'void main() { gl_Position = vec4(aPos, 0.0, 1.0); }\n';

  var FRAG = '#version 300 es\n' +
    'precision highp float;\n' +
    'uniform vec2 iResolution;\n' +
    'uniform float iTime;\n' +
    'out vec4 fragColor;\n' +
    SHADER + '\n' +
    'void main() { mainImage(fragColor, gl_FragCoord.xy); }\n';

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[shader-footer] compile:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[shader-footer] link:', gl.getProgramInfoLog(prog));
    return;
  }

  var posLoc = gl.getAttribLocation(prog, 'aPos');
  var uTime = gl.getUniformLocation(prog, 'iTime');
  var uRes = gl.getUniformLocation(prog, 'iResolution');

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  function resize() {
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.round(rect.width * dpr));
    var h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var visible = false;
  var rafId = 0;
  var start = performance.now();

  function draw(t) {
    var elapsed = (t - start) / 1000;
    gl.useProgram(prog);
    gl.uniform1f(uTime, elapsed);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (visible) rafId = requestAnimationFrame(draw);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !visible) {
        visible = true;
        if (reducedMotion) {
          draw(performance.now());
          visible = false;
        } else {
          rafId = requestAnimationFrame(draw);
        }
      } else if (!e.isIntersecting && visible) {
        visible = false;
        cancelAnimationFrame(rafId);
      }
    });
  }, { rootMargin: '100px' });
  io.observe(canvas);
})();
