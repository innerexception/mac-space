
type Arc = [number, number];
export const compute = (x: number, y: number, R: number, map:Array<Array<number>>) => {
    let visibleCoords = new Array(map.length).fill(null).map((item) => 
                        new Array(map[0].length).fill(false))
    /* this place is always visible */
    visibleCoords[x][y]=true;

    /* list of all shadows */
    let SHADOWS: Arc[]= [];
    let cx, cy, blocks, A1, A2, visibility;

    /* analyze surrounding cells in concentric rings, starting from the center */
    for (let r=1; r<=R; r++) {
        let neighbors = _getCircle(x, y, r);
        let neighborCount = neighbors.length;

        for (let i=0;i<neighborCount;i++) {
            cx = neighbors[i][0];
            cy = neighbors[i][1];
            /* shift half-an-angle backwards to maintain consistency of 0-th cells */
            A1 = [i ? 2*i-1 : 2*neighborCount-1, 2*neighborCount];
            A2 = [2*i+1, 2*neighborCount]; 
            
            blocks = !_lightPasses(cx, cy);
            visibility = _checkVisibility(A1 as Arc, A2 as Arc, blocks, SHADOWS);
            if (visibility) { visibleCoords[cx][cy]=true; }

            if (SHADOWS.length == 2 && SHADOWS[0][0] == 0 && SHADOWS[1][0] == SHADOWS[1][1]) { return; } /* cutoff? */

        } /* for all cells in this ring */
    } /* for all rings */
    return visibleCoords
}

const _lightPasses = (x:number, y:number) => true //TODO

const _checkVisibility = (A1: Arc, A2: Arc, blocks: boolean, SHADOWS: Arc[]): number => {
    if (A1[0] > A2[0]) { /* split into two sub-arcs */
        let v1 = _checkVisibility(A1, [A1[1], A1[1]], blocks, SHADOWS);
        let v2 = _checkVisibility([0, 1], A2, blocks, SHADOWS);
        return (v1+v2)/2;
    }

    /* index1: first shadow >= A1 */
    let index1 = 0, edge1 = false;
    while (index1 < SHADOWS.length) {
        let old = SHADOWS[index1];
        let diff = old[0]*A1[1] - A1[0]*old[1];
        if (diff >= 0) { /* old >= A1 */
            if (diff == 0 && !(index1 % 2)) { edge1 = true; }
            break;
        }
        index1++;
    }

    /* index2: last shadow <= A2 */
    let index2 = SHADOWS.length, edge2 = false;
    while (index2--) {
        let old = SHADOWS[index2];
        let diff = A2[0]*old[1] - old[0]*A2[1];
        if (diff >= 0) { /* old <= A2 */
            if (diff == 0 && (index2 % 2)) { edge2 = true; }
            break;
        }
    }

    let visible = true;
    if (index1 == index2 && (edge1 || edge2)) {  /* subset of existing shadow, one of the edges match */
        visible = false; 
    } else if (edge1 && edge2 && index1+1==index2 && (index2 % 2)) { /* completely equivalent with existing shadow */
        visible = false;
    } else if (index1 > index2 && (index1 % 2)) { /* subset of existing shadow, not touching */
        visible = false;
    }
    
    if (!visible) { return 0; } /* fast case: not visible */
    
    let visibleLength;

    /* compute the length of visible arc, adjust list of shadows (if blocking) */
    let remove = index2-index1+1;
    if (remove % 2) {
        if (index1 % 2) { /* first edge within existing shadow, second outside */
            let P = SHADOWS[index1];
            visibleLength = (A2[0]*P[1] - P[0]*A2[1]) / (P[1] * A2[1]);
            if (blocks) { SHADOWS.splice(index1, remove, A2); }
        } else { /* second edge within existing shadow, first outside */
            let P = SHADOWS[index2];
            visibleLength = (P[0]*A1[1] - A1[0]*P[1]) / (A1[1] * P[1]);
            if (blocks) { SHADOWS.splice(index1, remove, A1); }
        }
    } else {
        if (index1 % 2) { /* both edges within existing shadows */
            let P1 = SHADOWS[index1];
            let P2 = SHADOWS[index2];
            visibleLength = (P2[0]*P1[1] - P1[0]*P2[1]) / (P1[1] * P2[1]);
            if (blocks) { SHADOWS.splice(index1, remove); }
        } else { /* both edges outside existing shadows */
            if (blocks) { SHADOWS.splice(index1, remove, A1, A2); }
            return 1; /* whole arc visible! */
        }
    }

    let arcLength = (A2[0]*A1[1] - A1[0]*A2[1]) / (A1[1] * A2[1]);

    return visibleLength/arcLength;
}

const _getCircle = (cx: number, cy: number, r: number) => {
    let result = [];
    let dirs, countFactor, startOffset;
    let topology = 8
    switch (topology) {
        case 4:
            countFactor = 1;
            startOffset = [0, 1];
            dirs = [
                DIRS[8][7],
                DIRS[8][1],
                DIRS[8][3],
                DIRS[8][5]
            ];
        break;

        case 6:
            dirs = DIRS[6];
            countFactor = 1;
            startOffset = [-1, 1];
        break;

        case 8:
            dirs = DIRS[4];
            countFactor = 2;
            startOffset = [-1, 1];
        break;

        default:
            throw new Error("Incorrect topology for FOV computation");
        break;
    }

    /* starting neighbor */
    let x = cx + startOffset[0]*r;
    let y = cy + startOffset[1]*r;

    /* circle */
    for (let i=0;i<dirs.length;i++) {
        for (let j=0;j<r*countFactor;j++) {
            result.push([x, y]);
            x += dirs[i][0];
            y += dirs[i][1];

        }
    }

    return result;
}

const DIRS = {
	4: [[0, -1], [1, 0], [0, 1], [-1, 0]],
	8: [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]],
	6: [[-1, -1], [1, -1], [2, 0], [1, 1], [-1, 1], [-2, 0]]
};