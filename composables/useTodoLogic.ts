import type { Todo } from '../type'; // Todoの型定義
import { useNuxtApp } from '#app';
import { computed } from 'vue';

// ====================
//    ** ロジック **
// ====================
    
// 新規または編集のTodoを追加・更新する関数
export const saveTodo = () => {

    // 状態を取得
    const isEditing = useState('isEditing'); // 編集モード
    const newTodo = useNewTodo();            // todoの初期値

    if (isEditing.value) {
        updateTodo(newTodo.value); // 編集モードのためタスクの更新
    } else {
        addTodo(); //タスクの新規登録 
    }

    toggleEditMode(false); // 編集モードを解除
};

// 編集時のTodoをセット
export const setEditMode = (todo: Todo) => {
    const newTodo = useNewTodo(); // todoの初期値
    newTodo.value = { ...todo };  // 編集対象のTodoをセット
    toggleEditMode(true);         // 編集モード
};

/**
 * 新規タスクとして入力された値をsupabaseのDB（テーブル：2410_todoapp）にINSERT
 * 
 * [処理の流れ]
 *  1. 状態を取得
 *      *supabase {User} Supabaseのテーブル：2410_todoapp の全データ
 *      *newTodo  {Todo} todoの初期値
 *  2. 入力値のバリデーション
 *      └ Todo Titleが入力されている場合のみパス
 *      └ 空欄 or 有効な日付（YYYY-MM-DD）の場合にパス
 *  3. Supabaseの `2410_todoapp` テーブルにnewTodoを挿入
 *  4. newTodoをリセット
 *  5. Todoリストを最新の状態に更新
 * 
 * @async
 * @returns {Promise<void>}
 */
export const addTodo = async () => {
    // 状態管理
    const { $supabase } = useNuxtApp(); // Supabaseのクライアントを取得
    const newTodo = useNewTodo();       // 新規登録用のtodoの初期値を取得

    // [Validation 1] Todo Titleが入力されている場合のみパス
    if (!newTodo.value.title) {
        alert('Todo Title は入力必須項目です');
        return;
    };

    // [Validation 2] 空欄 or 有効な日付（YYYY-MM-DD）の場合にパス
    if (newTodo.value.deadline) {
        if (!isValidDate(newTodo.value.deadline)) {
            alert('Deadlineは有効な日付 (YYYY-MM-DD) で入力してください');
            return;
        }

        // 入力が無い場合はnullを代入
        } else {
        newTodo.value.deadline = null;
    };

    const user = await checkUserSession(); // セッションを確認してユーザーを取得
    if (!user) {
        console.error('User is not logged in.');
        return;
    };

    // DBに入力値を挿入
    const { data, error } = await $supabase
        .from('2410_todoapp')
        .insert([{
            title: newTodo.value.title,
            detail: newTodo.value.detail,
            deadline: newTodo.value.deadline,
            status: false,
            user_id: user.id
        }])
        .select('*'); // 挿入後のデータを返す;

    // DBへの挿入でエラーが発生した場合
    if (error) {
        console.error("Error inserting todo:", error.message);
        alert("Failed to add the task. Please try again.");
        return;
    };

    // DBへ正常に挿入できた場合
    if (data) {
        await fetchTodos(); // todosの値をデータベースの値と同期
        resetNewTodo();     // newTodoの値をリセット
    };    
};

const checkUserSession = async () => {
    const { $supabase } = useNuxtApp(); // Supabaseのクライアントを取得

    const { data: { session } } = await $supabase.auth.getSession();
    if (!session) {
        console.error('No active session. User is not logged in.');
        return null;
    }
    return session.user;
};

/**
 * 昇順or降順にてソートされた Todo 一覧を返す関数
 * 
 * [処理の流れ]
 *  1. 状態を取得
 *      *todos        {Todo[]} todo一覧
 *      *selectedSort {String} ブラウザで選択された「昇順」or「降順」
 *  2. todosに値が無い場合は、空白の配列をreturnして処理終了
 *  3. todosをidをキーに 昇順 or 降順でソートする
 * 
 * @returns {Todo[]} ソートされた Todo リスト。Todo が存在しない場合は空の配列を返します。
 */
export const sortedTodosList = computed<Todo[]>(() => {
    // 状態管理
    const todos = useTodos();               // Todoリストの状態を取得
    const selectedSort = useSelectedSort(); // ブラウザで選択されているソート項目
    // console.log('computed: ' + selectedSort.value);
    const isCompletion = useIsCompletion(); // 完了・未完了
    // const sortField = useSortField();
    const sortOrder = useSortOrder();

    if(!todos.value.length) return [];

    const filterdTodos = isCompletion.value
        ? todos.value.filter(todo => todo.status)
        : todos.value.filter(todo => !todo.status);

    

    const sortedArray = [...filterdTodos].sort((a, b) => {
        const fieldA = a[selectedSort.value as keyof Todo] as unknown as string | number;
        const fieldB = b[selectedSort.value as keyof Todo] as unknown as string | number;

        // `deadline`フィールドの特別な処理
        if (selectedSort.value === 'deadline') {
            const dateA = fieldA ? new Date(fieldA as string).getTime() : Infinity;
            const dateB = fieldB ? new Date(fieldB as string).getTime() : Infinity;

            // nullまたは空欄の'deadline'は常に最後方
            if (!fieldA) return 1;  // `fieldA`が空ならば`a`を後ろに移動
            if (!fieldB) return -1; // `fieldB`が空ならば`b`を後ろに移動

            // 正常な日付の比較
            return sortOrder.value === 'asc'
                ? dateA - dateB
                : dateB - dateA;
        }

        // 文字列の場合、localeCompare で比較
        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
            return sortOrder.value === 'asc'
                ? fieldA.localeCompare(fieldB)
                : fieldB.localeCompare(fieldA);
        };

        // 数値・日付の比較
        return sortOrder.value === 'asc'
                ? (fieldA as number) - (fieldB as number)
                : (fieldB as number) - (fieldA as number);
    });

    // ソートが完了したtodoをreturn
    return sortedArray;
});

/**
 * SupabaseからTodoリストのデータを取得し、`todos`の状態を更新する関数
 * 
 * [処理の流れ]
 *  1. 状態を取得
 *      *supabase {User}   Supabaseのテーブル：2410_todoapp の全データ
 *      *todos    {Todo[]} todo一覧
 *  2. エラーが発生した場合、エラーメッセージをコンソールに表示して処理を終了
 *  3. 正常にデータを取得した場合、`todos` の値を更新して同期する
 * 
 * @async
 * @returns {Promise<void>}
 */
export const fetchTodos = async () => {
    // 状態管理
    const { $supabase } = useNuxtApp(); // Supabaseのクライアントを取得
    const todos = useTodos();           // Todoリストの状態を取得

    // DBから全データを取得
    try {
        const { data, error } = await $supabase
            .from('2410_todoapp')
            .select('*');
    
        if (error) {
            console.error('Error fetching todos:', error.message);
            todos.value = []; // エラー時は状態を空にリセット
            return;
        }
        // console.log('Fetched todos:', data);

        // 同期 - 既存のtodosの配列をクリアし、新しいデータで更新
        todos.value.splice(0, todos.value.length, ...data || []);

    } catch (err) {
        console.error('Fetch error:', err);
        todos.value = []; // エラー時は状態を空にリセット
    };
};



/**
 * 完了したtodosの一覧を取得
 */
// export const getCompletedTodos = async () => {
//     const { $supabase } = useNuxtApp();
//     const completedTodos = useCompletedTodos();

//     const { data, error } = await $supabase
//         .from('2410_todoapp')
//         .select('*')
//         .eq('status', true);

//     if (error) {
//         console.log('Error fetching Completed Data:', error.message);
//         completedTodos.value = []; // エラーが発生した場合、空の配列にリセット
//         return [];
//     };

//     completedTodos.value = data || []; // データがない場合も空配列をセット
//     return completedTodos.value;
// };


/**
 * newTodo の状態を初期化する関数
 */
export const resetNewTodo = () => {
    const newTodo = useNewTodo(); // 状態を取得

    Object.assign(newTodo.value, {
        title: '',
        detail: '',
        deadline: '',
        status: false,
        id: 0
    });
};


// 編集対象のtodoを取得
export const setEditedTodo  = (editedId: number) => {
    const todos = useTodos();           // DBから取得したTodo一覧
    const editedTodo = useEditedTodo(); // editedTodoの状態

    console.log('Fetched todos:', todos.value); // 取得したtodosを確認
    console.log('Setting editedTodo with ID:', editedId); // IDを確認

    // 編集対象のTodoを検索
    const targetTodo = todos.value.find((todo) => {
        return todo.id === editedId
    });

    if (targetTodo) {
        // 編集対象のTodoが見つかったら、editedTodoにセット
        editedTodo.value = targetTodo;
        console.log('Todo found:', targetTodo);

    } else {
        console.error(`Todo with ID ${editedId} not found`);
    }
};

// Todoを更新
export const updateTodo = async (updatedTodo: Todo) => {
    const { $supabase } = useNuxtApp(); // Supabaseのクライアントを取得

    const { error } = await $supabase
        .from('2410_todoapp')
        .update({ 
            title: updatedTodo.title,
            detail: updatedTodo.detail,
            deadline: updatedTodo.deadline,
            status: updatedTodo.status
        })
        .eq('id', updatedTodo.id);

    if (error) console.error(error);

    resetNewTodo(); // newTodoの値をリセット
    fetchTodos();   // todosの値をデータベースの値と同期
};

// Todoを削除する
/**
 * 指定されたIDのTodoをSupabaseデータベースから削除する関数
 * 
 * [処理の流れ]
 *  1. Supabaseから `2410_todoapp` テーブルの全データを取得（todos）
 *  2. 該当のidと紐づくデータをDBから削除
 *  3. 削除後のtodosをDBから取得（これにより、ブラウザ上でも該当のtodoが削除される）
 * 
 * @async
 * @function deleteTodo
 * @param {Object} todo - 削除対象のTodo
 * @returns {Promise<void>}
 * @throws {Error} Supabaseの操作や非同期処理でエラーが発生した場合、そのエラーをコンソールに表示
 */
export const deleteTodo = async (todo: Todo) => {
    const { $supabase } = useNuxtApp(); // Supabaseのクライアントを取得
    console.log("Deleting todo with ID:", todo.id); // デバッグ用のログ

    try {
        // 削除実行の確認
        let confirmationForDelete = window.confirm('Todo No. ' + todo.id + ' を削除して良いですか？');

        if (confirmationForDelete) {
            // データベースから指定したIDのTodoを削除
            const { data, error } = await $supabase
            .from('2410_todoapp') // テーブル名を指定
            .delete() // delete メソッド
            .eq('id', todo.id); // id が指定したtodoIdのものを削除
        
            if (error) {
            console.error('Error deleting todo:', error.message);
            return;
            }
        
            console.log('Todo deleted:', data);
            
            // Todoリストを再取得（削除後のtodosがブラウザに表示されるように）
            await fetchTodos();
        }
    } catch (err) {
        console.error('Delete error:', err);
    };
};

// 日付が有効かどうかを判定する関数
export const isValidDate = (dateString: string) => {

    // 日付が "YYYY-MM-DD" 形式かを確認するための正規表現
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(dateString)) {
    return false;
    }

    // 日付が存在するかを確認するために new Date() を使用
    const date = new Date(dateString);
    const timestamp = date.getTime();

    // 日付が無効な場合、timestamp は NaN になる
    if (isNaN(timestamp)) {
    return false;
    };

    // 月と日が範囲内かどうかを確認する
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // 月は0から始まるので +1
    const day = date.getUTCDate();

    const [inputYear, inputMonth, inputDay] = dateString.split('-').map(Number);
    
    return year === inputYear && month === inputMonth && day === inputDay;
};

// 編集モードの ON/OFF
export const toggleEditMode = (showEdit: boolean) => {
    const isEditing = useIsEditing();
    isEditing.value = showEdit;
};


