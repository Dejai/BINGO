<?php 
	require_once $_SERVER["DOCUMENT_ROOT"] . "/lib/php/common.php";

	$balls_raw_data = $myphp->GetFileContent("./data/balls.json");
	$balls_json = json_decode(implode($balls_raw_data));

	function generateBingoTable()
	{
		global $balls_json;
		$cells = "";
		foreach($balls_json as $letter => $numbers)
		{
			$cells .= "<td><table class=\"table\">";

			$start = $numbers[0];
			$end   = $numbers[count($numbers)-1];
			for($idx = $start; $idx <= $end; $idx++ )
			{
				$cells .= "<tr><td class='bingo_cell cell_unseen' data-letter='$letter'>". $idx . "</td></tr>";

			}
			$cells .= "</table></td>";
		}
		echo $cells;
	}
?>
