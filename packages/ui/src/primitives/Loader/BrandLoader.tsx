'use client';

/**
 * RASHX Official Brand Loader (Triple-Panel Curtain Splash)
 *
 * Single Source of Truth: rashx-brand/loader/loader.html
 * Features:
 * - 3 layered curtain panels (Dusty Blue -> Warm Peach -> Soft Cream with curved drapery)
 * - Animated Rx monogram with bottom-to-top ink fill via SVG clip-path
 * - Dynamic status messages localized in Arabic and English
 * - Smooth easing progression with 1800ms minimum display threshold
 * - Global window.RashxLoader API for programmatic replay/ready control
 * - WCAG AA accessible progressbar attributes & reduced-motion support
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '../../lib/cn';

export interface BrandLoaderProps {
  /** Active language for status messages */
  lang?: 'ar' | 'en';
  /** Force show regardless of session or previous loads */
  forceShow?: boolean;
  /** Callback fired when the loader animation finishes and dismisses */
  onComplete?: () => void;
  /** Additional CSS class names */
  className?: string;
}

const MESSAGES_AR: [number, string][] = [
  [0, 'جاري التحضير'],
  [35, 'بنجهّز الصالون'],
  [70, 'لمسات أخيرة'],
  [100, 'جاهز'],
];

const MESSAGES_EN: [number, string][] = [
  [0, 'Preparing...'],
  [35, 'Setting up the salon...'],
  [70, 'Finishing touches...'],
  [100, 'Ready'],
];

// Official Rx symbol path from rashx-brand
const RX_PATH =
  'M601.1 999.7C601.0 999.5 602.5 997.4 604.3 995.1C612.6 984.7 615.6 981.0 619.2 976.7C621.3 974.2 624.7 970.0 626.7 967.5C628.8 965.0 633.2 959.6 636.5 955.6C645.4 944.8 647.6 942.1 653.6 934.6C661.2 925.2 668.5 916.1 675.5 907.6C678.8 903.5 683.7 897.5 686.5 894.1C691.4 887.9 699.4 878.1 706.4 869.5C713.7 860.5 726.9 844.1 730.6 839.3C732.7 836.7 735.3 833.5 736.3 832.4C737.3 831.2 739.8 828.1 741.9 825.5C747.5 818.5 750.6 814.7 755.1 809.3C758.8 804.8 761.5 801.4 767.7 793.5C769.1 791.7 772.3 787.8 774.8 784.7C777.3 781.6 780.2 778.1 781.2 776.8C782.3 775.5 785.2 771.9 787.8 768.7C790.4 765.6 797.4 757.0 803.2 749.7C822.5 725.8 825.9 721.5 829.9 716.8C832.0 714.3 834.9 710.7 836.4 708.8C837.9 706.9 840.8 703.2 843.0 700.7C845.1 698.2 849.7 692.6 853.1 688.3C867.9 670.0 870.3 667.1 872.7 664.0C874.1 662.2 877.8 657.7 881.0 653.8C884.1 650.0 888.6 644.4 891.0 641.5C893.4 638.5 895.9 635.5 896.5 634.8L897.6 633.4L964.9 633.3C1001.9 633.2 1032.5 633.3 1033.0 633.4C1033.4 633.5 1033.8 633.8 1033.8 634.0C1033.8 634.4 1030.2 639.2 1027.0 643.1C1025.8 644.5 1022.6 648.4 1020.0 651.7C1017.4 655.0 1013.9 659.3 1012.3 661.3C1007.2 667.6 999.4 677.3 991.6 687.0C982.1 698.8 972.6 710.6 961.7 723.9C957.1 729.7 952.4 735.5 951.4 736.8C950.3 738.2 946.3 743.1 942.5 747.8C938.7 752.5 932.9 759.7 929.6 763.8C923.3 771.7 914.2 782.8 907.3 791.2C905.0 794.1 903.1 796.7 903.1 797.0C903.1 797.3 905.3 800.5 907.9 804.1C910.6 807.7 914.4 812.9 916.4 815.6C918.4 818.4 922.6 824.2 925.8 828.5C929.0 832.9 933.1 838.5 935.0 841.0C936.8 843.5 940.8 848.9 943.9 853.1C947.0 857.2 951.2 863.1 953.3 866.0C955.4 869.0 959.0 873.9 961.2 877.0C963.5 880.1 968.9 887.7 973.3 893.8C977.7 899.9 986.0 911.3 991.7 919.3C997.5 927.2 1003.7 935.8 1005.5 938.3C1007.3 940.8 1010.8 945.7 1013.2 949.1C1015.7 952.4 1019.2 957.3 1021.0 959.9C1022.9 962.4 1026.3 967.2 1028.6 970.4C1031.0 973.6 1035.1 979.3 1037.8 983.0C1045.3 993.2 1048.8 998.4 1048.8 999.3C1048.8 1000.0 1047.9 1000.0 973.5 1000.0C913.9 1000.0 898.1 999.9 897.7 999.5C897.3 999.3 894.8 995.9 892.1 992.1C889.4 988.3 885.4 982.7 883.1 979.6C880.8 976.6 877.3 971.6 875.2 968.7C871.0 962.8 863.3 952.1 843.5 924.6C828.2 903.4 824.0 897.7 823.4 897.7C823.1 897.7 822.1 898.8 821.2 900.1C820.3 901.5 817.8 904.6 815.7 907.2C811.9 911.6 796.2 931.0 792.0 936.4C790.8 937.9 787.9 941.5 785.5 944.5C783.0 947.5 779.5 951.8 777.7 954.1C775.8 956.4 772.6 960.3 770.7 962.7C768.7 965.1 765.1 969.6 762.7 972.6C760.3 975.6 754.6 982.7 749.9 988.5C745.3 994.3 741.3 999.3 740.9 999.5C740.2 1000.1 601.5 1000.2 601.1 999.7ZM0.2 985.4C-0.2 984.7 0.3 984.4 3.7 983.6C8.2 982.4 17.5 979.5 24.4 977.1C27.8 975.9 32.5 974.3 34.8 973.5C39.5 971.8 59.1 963.9 70.0 959.2C77.9 955.8 104.5 942.7 111.7 938.7C125.9 930.8 133.3 926.4 142.9 920.4C203.4 882.2 242.7 837.2 264.0 782.0C267.3 773.2 270.0 765.2 271.7 758.6C272.0 757.4 272.8 754.2 273.5 751.4C274.6 747.2 276.5 738.3 278.5 727.0C279.6 721.3 280.3 715.9 281.8 700.3C283.6 682.7 283.5 700.5 283.6 339.3C283.7 92.4 283.9 0.9 284.2 0.5C284.7 -0.1 696.9 -0.2 709.3 0.4C717.2 0.8 724.7 1.3 729.7 1.9C731.5 2.1 735.3 2.6 738.2 2.9C779.7 7.7 818.9 19.3 856.2 37.9C931.5 75.5 984.1 135.9 1006.8 210.9C1009.2 218.8 1009.8 221.3 1011.9 231.8C1015.9 251.1 1017.7 268.9 1017.7 288.7C1017.7 298.8 1016.5 317.4 1015.4 324.2C1015.2 325.5 1014.7 328.9 1014.2 331.8C1008.8 366.6 994.0 404.0 972.9 435.9C949.8 470.7 917.2 502.1 880.8 524.5C865.1 534.2 850.6 541.6 830.4 550.3C811.8 558.3 782.1 567.5 762.4 571.5C759.8 572.0 756.4 572.7 754.9 573.0C753.4 573.3 750.4 573.9 748.2 574.2C742.8 575.0 742.4 575.1 742.4 575.7C742.4 576.3 745.8 581.2 753.0 590.7C757.0 596.1 770.0 613.8 778.3 625.1C780.2 627.7 784.1 633.0 787.0 636.8C789.8 640.7 793.4 645.5 794.9 647.6C796.5 649.8 802.0 657.1 807.1 664.0C832.2 697.7 832.0 697.4 830.6 698.6C829.7 699.4 825.4 704.5 818.1 713.5C814.6 717.8 808.3 725.7 804.0 731.0C799.7 736.3 795.0 742.1 793.6 743.9C792.2 745.7 789.7 748.7 788.1 750.6C786.6 752.6 784.0 755.7 782.6 757.6C781.1 759.5 777.8 763.6 775.3 766.6C772.7 769.7 768.1 775.3 765.1 779.1C755.7 790.9 756.1 790.5 755.3 790.2C755.0 790.1 752.2 786.4 748.9 781.9C745.7 777.4 741.1 771.2 738.7 768.1C736.4 765.0 733.1 760.6 731.4 758.3C729.8 756.0 726.8 752.0 724.8 749.4C722.7 746.8 720.0 743.2 718.8 741.5C717.5 739.7 713.9 734.9 710.9 730.8C707.8 726.7 702.9 720.2 700.0 716.3C697.1 712.4 691.1 704.3 686.7 698.4C682.4 692.5 678.3 687.0 677.8 686.3C677.3 685.5 675.4 683.1 673.7 680.8C671.9 678.5 669.0 674.7 667.3 672.3C665.6 669.9 661.6 664.5 658.4 660.3C655.2 656.1 651.5 651.1 650.1 649.2C648.8 647.3 645.8 643.3 643.6 640.3C640.2 635.7 638.4 633.3 633.4 626.7C627.5 618.9 617.2 605.0 614.2 600.9C612.1 598.0 609.2 594.3 607.9 592.7L605.5 589.8L516.8 589.9C433.4 590.0 427.8 590.0 423.3 590.7C420.7 591.1 418.1 591.6 417.5 591.8L416.6 592.3L416.3 624.0C416.2 641.4 416.0 656.6 415.9 657.6C415.7 658.7 415.4 663.2 415.2 667.6C414.4 685.3 412.8 704.2 411.2 715.7C410.9 717.8 410.4 721.6 410.0 724.1C408.1 738.5 404.9 755.2 401.9 767.0C399.2 777.8 398.2 781.2 396.2 788.1C389.5 810.5 378.5 836.7 369.6 851.8C368.1 854.3 365.9 858.1 364.7 860.2C363.4 862.4 360.5 867.0 358.1 870.6C333.4 907.0 303.6 933.0 263.7 952.9C222.2 973.6 178.6 983.8 125.1 985.4C105.9 985.9 0.5 985.9 0.2 985.4ZM689.2 479.8C713.7 478.5 730.8 475.5 751.4 468.8C802.8 452.2 844.2 416.1 865.5 369.3C867.0 366.1 868.4 363.0 868.7 362.4C871.2 356.8 875.9 341.9 878.1 332.6C881.4 318.3 882.5 307.6 882.5 290.1C882.6 269.9 881.2 260.2 875.7 239.5C868.8 213.8 853.2 187.8 833.0 168.1C804.9 140.8 769.1 123.8 724.5 116.6C713.8 114.8 707.0 114.0 696.7 113.4C687.8 112.8 417.0 112.5 415.9 113.1C415.2 113.4 415.2 118.7 415.2 296.4C415.2 438.1 415.3 479.4 415.7 479.7C416.3 480.3 677.9 480.4 689.2 479.8Z';

export function BrandLoader({
  lang = 'ar',
  forceShow = false,
  onComplete,
  className,
}: BrandLoaderProps) {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isGone, setIsGone] = useState(false);
  const [message, setMessage] = useState(lang === 'ar' ? 'جاري التحضير' : 'Preparing...');

  const clipRef = useRef<SVGRectElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const pctRef = useRef<HTMLElement>(null);
  const msgRef = useRef<HTMLElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const loadedRef = useRef<boolean>(false);
  const finishedRef = useRef<boolean>(false);

  const msgs = lang === 'ar' ? MESSAGES_AR : MESSAGES_EN;

  const renderProgress = useCallback(
    (p: number) => {
      const v = Math.round(p);
      setProgress(v);

      if (clipRef.current) {
        clipRef.current.setAttribute('y', String(1000 - p * 10));
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p / 100})`;
      }
      if (pctRef.current) {
        pctRef.current.textContent = `${v}%`;
      }
      if (loaderRef.current) {
        loaderRef.current.setAttribute('aria-valuenow', String(v));
      }

      for (let i = msgs.length - 1; i >= 0; i--) {
        const [threshold, text] = msgs[i]!;
        if (v >= threshold) {
          setMessage(text);
          if (msgRef.current) {
            msgRef.current.textContent = text;
          }
          break;
        }
      }
    },
    [msgs],
  );

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    // Small hold at 100%
    setTimeout(() => {
      setIsDone(true);

      // Dismiss panels after curtain transition finishes
      setTimeout(() => {
        setIsGone(true);
        if (typeof document !== 'undefined') {
          document.body.style.overflow = '';
          document.dispatchEvent(new Event('rashx:loaded'));
        }
        onComplete?.();
      }, 1300);
    }, 250);
  }, [onComplete]);

  const tick = useCallback(
    (t: number) => {
      if (!startRef.current) startRef.current = t;
      const el = t - startRef.current;
      const MIN = 1800;

      // Ease toward 85% while waiting; release to 100% once ready and MIN threshold reached
      const target = loadedRef.current && el >= MIN ? 100 : Math.min(85, (el / MIN) * 85);
      const current = progress;
      let next = current + (target - current) * 0.08;

      if (target === 100 && next > 99.4) {
        next = 100;
      }

      renderProgress(next);

      if (next >= 100) {
        finish();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [progress, renderProgress, finish],
  );

  const startLoader = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    finishedRef.current = false;
    loadedRef.current = false;
    startRef.current = 0;
    setIsDone(false);
    setIsGone(false);

    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    renderProgress(0);
    rafRef.current = requestAnimationFrame(tick);

    // Track document ready state
    if (typeof document !== 'undefined') {
      if (document.readyState === 'complete') {
        setTimeout(() => {
          loadedRef.current = true;
        }, 400);
      } else {
        const onLoad = () => {
          loadedRef.current = true;
        };
        window.addEventListener('load', onLoad, { once: true });
      }
    }
  }, [renderProgress, tick]);

  useEffect(() => {
    setMounted(true);

    // Session-based or forced run
    const hasSeenLoader =
      !forceShow && typeof window !== 'undefined'
        ? sessionStorage.getItem('rashx_loader_shown')
        : null;

    if (!hasSeenLoader || forceShow) {
      startLoader();
      if (typeof window !== 'undefined' && !forceShow) {
        sessionStorage.setItem('rashx_loader_shown', 'true');
      }
    } else {
      setIsGone(true);
    }

    // Expose global API
    if (typeof window !== 'undefined') {
      (window as unknown as { RashxLoader: { ready: () => void; replay: () => void } }).RashxLoader = {
        ready: () => {
          loadedRef.current = true;
        },
        replay: () => {
          startLoader();
        },
      };
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [forceShow, startLoader]);

  if (!mounted || isGone) {
    return null;
  }

  return (
    <div
      id="rashx-loader"
      ref={loaderRef}
      role="progressbar"
      aria-label={lang === 'ar' ? 'جاري التحميل' : 'Loading RASHX'}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      className={cn(
        'fixed inset-0 z-[99999] pointer-events-auto select-none overflow-hidden font-sans',
        isDone && 'done',
        className,
      )}
    >
      {/* ── Panel 1: Dusty Blue Curtain ───────────────────────── */}
      <div className="rashx-loader-panel rashx-loader-p1" />

      {/* ── Panel 2: Warm Peach Curtain ───────────────────────── */}
      <div className="rashx-loader-panel rashx-loader-p2" />

      {/* ── Panel 3: Soft Cream Stage with Scalloped Drapery ──── */}
      <div className="rashx-loader-panel rashx-loader-p3">
        <div className="rashx-loader-stage">
          {/* Official Breathing Rx Mark with bottom-up fill */}
          <svg
            className="rashx-loader-mark"
            viewBox="0 0 1048.8 1000"
            aria-hidden="true"
          >
            <defs>
              <clipPath id="rashx-loader-clip">
                <rect
                  ref={clipRef}
                  x={0}
                  y={1000}
                  width={1048.8}
                  height={1000}
                />
              </clipPath>
            </defs>

            {/* Ghost outline */}
            <path
              d={RX_PATH}
              fill="rgba(84, 69, 61, 0.12)"
              fillRule="evenodd"
            />

            {/* Filled active foreground via clip-path */}
            <g clipPath="url(#rashx-loader-clip)">
              <path
                d={RX_PATH}
                fill="#54453D"
                fillRule="evenodd"
              />
            </g>
          </svg>

          {/* Progress Bar with Warm Peach to Dusty Blue Gradient */}
          <div className="rashx-loader-bar">
            <i
              ref={barRef}
              className="rashx-loader-bar-fill"
            />
          </div>

          {/* Localized Status Meta & Counter */}
          <div className="rashx-loader-meta text-[#54453D]">
            <span ref={msgRef}>{message}</span>
            <b ref={pctRef} className="rashx-loader-pct">
              {progress}%
            </b>
          </div>
        </div>
      </div>
    </div>
  );
}

