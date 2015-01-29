/* nAnjs stochastic simulation module
 *
 * usage: nAn_stochastics_module.apply(namespace);
 */

define("stochastics", [], function () {

var nAn_stochastics_module = function() {

    var THIS=this;

    /* Euler-Maruyama method
     *
     * Numerically simulates the Langevin equation,
     *
     *      dy/dt = A(y,t) + D(y,t) * noise(t)
     *
     * For Gaussian white noise. The equation is actually interpreted in
     * the Ito sense.
     *
     * Arguments:
     * A - function of (y,t,[c]) provides the non-stochastic rates
     * D - function of (y,t,[c]) provides the stochastic rates
     * parameters - array of parameters to be sent to the functions A,D
     * the rest should be self-explanatory
     */
    this.euler = function (A, D, initial, dt, t_final, pA,pD) {
        var d = initial.length;
        var N = Math.floor(t_final / dt);
        var result = new Float32Array(N * d);
        var t = new Float32Array(N);
        var n = 4; // the most random number
        var sdt = Math.sqrt(dt);

        // initial conditions
        var y_cur = initial.slice();
        for (j = 0; j < d; j++) result[j * N] = initial[j];
        // the grunt-work!
        for (i = 0; i < N-1; i++) {
            var A_cur = A(y_cur, t[i], pA)
            var D_cur = D(y_cur, t[i], pD)
            t[i+1] = (i+1) * dt;
            n = THIS.gaussian();
            for (j = 0; j < d; j++) 
                result[i + 1 + j * N] = y_cur[j] = 
                    y_cur[j] + dt * A_cur[j] + 
                        n*D_cur[j]*sdt;
        }
        return [t, result, N];
    };

    /* Milstein method
     *
     * Numerically simulates the Langevin equation,
     *
     *      dy/dt = A(y,t) + D(y,t) * noise(t)
     *
     * For Gaussian white noise. The equation is actually interpreted in
     * the Ito sense.
     *
     * Arguments:
     * A - function of (y,t,[c]) provides the non-stochastic rates
     * D - function of (y,t,[c]) provides the stochastic rates
     * Dy - derivative of D in y
     * parameters - array of parameters to be sent to the functions A,D
     * the rest should be self-explanatory
     */
    this.milstein = function (A, D, Dy, initial, dt, t_final, pA,pD) {
        var d = initial.length;
        var N = Math.floor(t_final / dt);
        var result = new Float32Array(N * d);
        var t = new Float32Array(N);
        var n = 4; // the most random number
        var sdt = Math.sqrt(dt);

        // initial conditions
        var y_cur = initial.slice();
        for (j = 0; j < d; j++) result[j * N] = initial[j];
        // the grunt-work!
        for (i = 0; i < N-1; i++) {
            var A_cur = A(y_cur, t[i], pA)
            var D_cur = D(y_cur, t[i], pD)
            var Dy_cur = Dy(y_cur, t[i], pD)
            t[i+1] = (i+1) * dt;
            n = THIS.boxMuller2();
            for (j = 0; j < d; j++) 
                result[i + 1 + j * N] = y_cur[j] = 
                    y_cur[j] + dt * A_cur[j] + n[0]*D_cur[j]*sdt
                    - dt/2*D_cur[j]*Dy_cur[j]*(1-n[1]*n[1]);
        }
        return [t, result, N];
    };

    /* Coloured Noise method
     *
     * Numerically simulates the Langevin equation,
     *
     *      dy/dt = A(y,t) + D(y,t) * noise(t)
     *
     * where the noise term is an Ornstein-Uhlenbeck process,
     * with autocorrelation:
     *
     *      <F(t)F(t-tau)> = sigma^2 exp(-|tau|/tau_c) .
     *
     * tau_c being the correlation time.
     *
     * Because the SDE is differentiable with coloured noise, the
     * Heun method is used to advance each time-step.
     *
     * Arguments:
     * A - function of (y,t,[c]) provides the non-stochastic rates
     * D - function of (y,t,[c]) provides the stochastic rates
     * sigma - standard deviation of gaussian noise
     * tau - correlation time of the noise
     * parameters - array of parameters to be sent to the functions A,D
     * the rest should be self-explanatory
     */
    this.colour = function (A, D, sigma, tau, initial, dt, t_final, pA, pD) {
        var d = initial.length;
        var N = Math.floor(t_final / dt);
        var result = new Float32Array(N * d);
        var noise = new Float32Array(N);
        var t = new Float32Array(N);
        var n = 4; // the most random number

        // coefficients to advance noise
        var rho = Math.exp(-dt/tau);
        var rhoc = sigma*Math.sqrt(1-rho*rho);

        // initial conditions
        var y_cur = initial.slice();
        for (j = 0; j < d; j++) result[j * N] = initial[j];
        var k1=new Array(d), k2=new Array(d);
        var y_next = y_cur.slice();
        for (i = 0; i < N-1; i++) {
            // advance the noise and time
            n = THIS.boxMuller();
            t[i+1] = (i+1) * dt;
            noise[i+1] = noise[i] *rho + n*rhoc;
            // use heun's method to advance the system
            var A_cur = A(y_cur, t[i], pA)
            var D_cur = D(y_cur, t[i], pD)
            for (j = 0; j<d; j++) {
                k1[j] = A_cur[j] + D_cur[j]*noise[i];
                y_next[j] = y_cur[j] + dt*k1[j];
            }
            var A_next = A(y_next, t[i], pA)
            var D_next = D(y_next, t[i], pD)
            for (j = 0; j < d; j++) {
                k2[j] = A_next[j] + D_next[j]*noise[i+1];
                result[i + 1 + j * N] = y_cur[j] = 
                    y_cur[j] + dt/2 * (k1[j]+k2[j]);
            }
        }
        return [t, result, N];
    };
    

    /* The Box Muller transform 
     */
    this.boxMuller = function() {
        var v1, v2, s, x;
        do {
            var u1 = Math.random();
            var u2 = Math.random();
            v1 = 2*u1-1;
            v2 = 2*u2-1;
            s = v1*v1 +v2*v2;
        } while (s>1);

        x = Math.sqrt( -2*Math.log(s)/s)*v1;
        return x;
    };
    
    /* Box Muller function that returns both Gaussians
     */
    boxMuller2 = function() {
        var v1, v2, s, x;
        do {
            var u1 = Math.random();
            var u2 = Math.random();
            v1 = 2*u1-1;
            v2 = 2*u2-1;
            s = v1*v1 +v2*v2;
        } while (s>1);

        x = Math.sqrt( -2*Math.log(s)/s)*v1;
        y = Math.sqrt( -2*Math.log(s)/s)*v2;
        return [x,y];
    };
    
    this.gaussian = this.boxMuller;

};

var m = {};
nAn_stochastics_module.apply(m);
return m;

});
