(function(){
    const selectors = {
      orderA_rows: '#orderA-rows',
      orderA_cols: '#orderA-cols',
      createA: '#create-matrixA',
      matrixA_grid: '#matrixA-grid',
      addRowA: '#add-rowA',
      addColA: '#add-colA',

      orderB_rows: '#orderB-rows',
      orderB_cols: '#orderB-cols',
      createB: '#create-matrixB',
      matrixB_grid: '#matrixB-grid',
      addRowB: '#add-rowB',
      addColB: '#add-colB',

      matrixB_section: '#matrixB-section',
      panelOperations: '.panel-operations',
      resultMatrix: '#result-matrix',
      stepsArea: '#steps'
    };

    // Elements references
    const el = {};
    for(const key in selectors){
      el[key] = document.querySelector(selectors[key]);
    }

    let matrixA = [], matrixB = [];
    let rowsA = parseInt(el.orderA_rows.value);
    let colsA = parseInt(el.orderA_cols.value);
    let rowsB = parseInt(el.orderB_rows.value);
    let colsB = parseInt(el.orderB_cols.value);

    // Utils
    function createInputCell(row, col){
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'matrix-cell';
      input.setAttribute('aria-label', `Elemen baris ${row+1} kolom ${col+1}`);
      input.dataset.row = row;
      input.dataset.col = col;
      input.value = '';
      input.autocomplete = 'off';
      input.addEventListener('keydown', e=>{
        const r = parseInt(input.dataset.row);
        const c = parseInt(input.dataset.col);
        const container = input.parentElement;
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const next = container.querySelector(`input[data-row="${r}"][data-col="${c+1}"]`);
          if (next) next.focus();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = container.querySelector(`input[data-row="${r}"][data-col="${c-1}"]`);
          if (prev) prev.focus();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const down = container.querySelector(`input[data-row="${r+1}"][data-col="${c}"]`);
          if (down) down.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const up = container.querySelector(`input[data-row="${r-1}"][data-col="${c}"]`);
          if (up) up.focus();
        }
      });
      return input;
    }

    function generateMatrixGrid(container, r, c, modelArr){
      container.innerHTML = '';
      container.style.gridTemplateColumns = `repeat(${c}, 56px)`;
      modelArr.length = 0;
      for(let i=0; i<r; i++){
        const rowArr = [];
        for(let j=0; j<c; j++){
          const cell = createInputCell(i,j);
          container.appendChild(cell);
          rowArr.push(cell);
        }
        modelArr.push(rowArr);
      }
    }

    function readMatrix(modelArr){
      const mat = [];
      for(let i=0; i<modelArr.length; i++){
        const rowArr = [];
        for(let j=0; j<modelArr[i].length; j++){
          let val = parseFloat(modelArr[i][j].value);
          if (isNaN(val)) val = 0;
          rowArr.push(val);
        }
        mat.push(rowArr);
      }
      return mat;
    }

    function displayResultMatrix(mat){
      el.resultMatrix.innerHTML = '';
      if (!mat || mat.length === 0) return;
      const r = mat.length, c = mat[0].length;
      el.resultMatrix.style.gridTemplateColumns = `repeat(${c}, 56px)`;
      for(let i=0; i<r; i++){
        for(let j=0; j<c; j++){
          const div = document.createElement('div');
          div.textContent = mat[i][j];
          el.resultMatrix.appendChild(div);
        }
      }
    }

    // Matrix operations
    const matOps = {
      add: (A,B) => {
        if(A.length !== B.length || A[0].length !== B[0].length) return null;
        const res = [];
        for(let i=0;i<A.length;i++){
          const row = [];
          for(let j=0; j<A[0].length; j++){
            row.push(A[i][j] + B[i][j]);
          }
          res.push(row);
        }
        return res;
      },
      subtract: (A,B) => {
        if(A.length !== B.length || A[0].length !== B[0].length) return null;
        const res = [];
        for(let i=0;i<A.length;i++){
          const row = [];
          for(let j=0; j<A[0].length; j++){
            row.push(A[i][j] - B[i][j]);
          }
          res.push(row);
        }
        return res;
      },
      multiply: (A,B) => {
        if(A[0].length !== B.length) return null;
        const res = [];
        for(let i=0; i<A.length; i++){
          const row = [];
          for(let j=0; j<B[0].length; j++){
            let sum=0;
            for(let k=0; k<A[0].length; k++){
              sum+= A[i][k]*B[k][j];
            }
            row.push(sum);
          }
          res.push(row);
        }
        return res;
      },
      adjoint: (A) => {
        const n = A.length;
        if (n !== A[0].length) return null;
        function minorMatrix(M,i,j){
          const res = [];
          for(let r=0; r<M.length; r++){
            if(r===i) continue;
            const row=[];
            for(let c=0;c<M.length;c++){
              if(c===j) continue;
              row.push(M[r][c]);
            }
            res.push(row);
          }
          return res;
        }
        function determinant(M){
          const size = M.length;
          if(size===1) return M[0][0];
          if(size===2) return M[0][0]*M[1][1]-M[0][1]*M[1][0];
          let det=0;
          for(let c=0;c<size;c++){
            det+= ((c%2===0)?1:-1)*M[0][c]*determinant(minorMatrix(M,0,c));
          }
          return det;
        }
        function cofactor(M,i,j){
          return determinant(minorMatrix(M,i,j));
        }
        const cofactors = [];
        for(let i=0;i<n;i++){
          const row=[];
          for(let j=0;j<n;j++){
            const sign = ((i+j)%2===0)?1:-1;
            row.push(sign*cofactor(A,i,j));
          }
          cofactors.push(row);
        }
        // transpose cofactors
        const adj = [];
        for(let i=0;i<n;i++){
          const row=[];
          for(let j=0;j<n;j++){
            row.push(cofactors[j][i]);
          }
          adj.push(row);
        }
        return adj;
      },
      determinant: (M) => {
        if(M.length!==3 || M[0].length!==3) return null;
        const m=M;
        return (m[0][0]*m[1][1]*m[2][2]+m[0][1]*m[1][2]*m[2][0]+m[0][2]*m[1][0]*m[2][1])
              -(m[2][0]*m[1][1]*m[0][2]+m[2][1]*m[1][2]*m[0][0]+m[2][2]*m[1][0]*m[0][1]);
      },
      transpose: (M) => {
        const res = [];
        for(let j=0;j<M[0].length;j++){
          const row=[];
          for(let i=0;i<M.length;i++){
            row.push(M[i][j]);
          }
          res.push(row);
        }
        return res;
      },
      obe: (A) => {
        // placeholder simpan sama saja
        return {res:A, steps:`Langkah-langkah Operasi OBE:\n- Pilih baris\n- Lakukan operasi elementer\n- Ulangi hingga bentuk akhir.`};
      },
      oke: (A) => {
        return {res:A, steps:`Langkah-langkah Operasi OKE:\n- Pilih kolom\n- Lakukan operasi elementer\n- Ulangi hingga bentuk akhir.`};
      }
    };

    function toggleMatrixB(show){
      if(show) el.matrixB_section.classList.remove('hidden');
      else el.matrixB_section.classList.add('hidden');
    }

    function updateMatrix(type){
      if(type==='A'){
        rowsA = parseInt(el.orderA_rows.value);
        colsA = parseInt(el.orderA_cols.value);
        generateMatrixGrid(el.matrixA_grid, rowsA, colsA, matrixA);
        clearResult();
      } else if(type==='B'){
        rowsB = parseInt(el.orderB_rows.value);
        colsB = parseInt(el.orderB_cols.value);
        generateMatrixGrid(el.matrixB_grid, rowsB, colsB, matrixB);
        clearResult();
      }
    }

    function clearResult(){
      displayResultMatrix([]);
      el.stepsArea.textContent = '';
    }

    function addDimension(type, dim){
      if(type==='A'){
        if(dim==='row' && rowsA<10) {
          rowsA++;
          el.orderA_rows.value = rowsA;
          updateMatrix('A');
        }
        else if(dim==='col' && colsA<10) {
          colsA++;
          el.orderA_cols.value = colsA;
          updateMatrix('A');
        }
      } else if(type==='B'){
        if(dim==='row' && rowsB<10) {
          rowsB++;
          el.orderB_rows.value = rowsB;
          updateMatrix('B');
        }
        else if(dim==='col' && colsB<10) {
          colsB++;
          el.orderB_cols.value = colsB;
          updateMatrix('B');
        }
      }
    }

    // Event Listeners Setup
    el.createA.addEventListener('click', ()=>updateMatrix('A'));
    el.createB.addEventListener('click', ()=>updateMatrix('B'));
    el.addRowA.addEventListener('click', ()=>addDimension('A','row'));
    el.addColA.addEventListener('click', ()=>addDimension('A','col'));
    el.addRowB.addEventListener('click', ()=>addDimension('B','row'));
    el.addColB.addEventListener('click', ()=>addDimension('B','col'));

    el.panelOperations.addEventListener('click', e => {
      if(!e.target.matches('.op-btn')) return;
      const op = e.target.dataset.op;
      const ops_need_B = ['add','subtract','multiply'];
      toggleMatrixB(ops_need_B.includes(op));

      const A = readMatrix(matrixA);
      const B = readMatrix(matrixB);

      let result = null;
      let steps = '';

      if(op === 'add' || op === 'subtract' || op === 'multiply'){
        if(op === 'add' || op === 'subtract'){
          if(A.length !== B.length || A[0].length !== B[0].length){
            alert('Operasi memerlukan Matriks A dan B berordo sama.');
            return;
          }
        }
        if(op === 'multiply' && A[0].length !== B.length){
          alert('Perkalian memerlukan jumlah kolom Matriks A sama dengan jumlah baris Matriks B.');
          return;
        }
        result = matOps[op](A,B);
        steps = `Operasi ${op.charAt(0).toUpperCase() + op.slice(1)} Matriks A dan B berordo ${A.length}x${A[0].length} selesai.`;
      } else if(['obe','oke'].includes(op)){
        const {res, steps: s} = matOps[op](A);
        result = res;
        steps = s;
      } else if(op === 'adjoint'){
        if(A.length!==A[0].length){
          alert('Adjoin hanya untuk Matriks A bujursangkar.');
          return;
        }
        result = matOps.adjoint(A);
        steps = `Operasi Adjoin Matriks A berordo ${A.length}x${A[0].length} selesai.`;
      } else if(op === 'transpose'){
        result = matOps.transpose(A);
        steps = `Operasi Transpose Matriks A berordo ${A.length}x${A[0].length} selesai.`;
      } else if(op === 'determinant'){
        if(A.length!==3 || A[0].length!==3){
          alert('Determinan metode Sarrus hanya untuk Matriks A berordo 3x3.');
          return;
        }
        const det = matOps.determinant(A);
        steps = `Determinan Matriks A 3x3 dengan metode Sarrus adalah: ${det}`;
        result = [[det]];
      }

      if(result){
        displayResultMatrix(result);
        el.stepsArea.textContent = steps;
      }
    });

    // Initialize
    updateMatrix('A');
    updateMatrix('B');
    toggleMatrixB(true);
  })();